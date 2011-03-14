# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

from django.db import transaction
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.utils import simplejson
from django.utils.translation import ugettext as _

from commons.authentication import get_user_authentication
from commons.get_data import get_inout_data, get_wiring_data, get_tab_data, get_filter_data
from commons.logs_exception import TracedServerError
from commons.resource import Resource
from commons.utils import json_encode
from connectable.models import In, Out, RelatedInOut, InOut, Filter, RemoteSubscription
from connectable.utils import createChannel, deleteChannel
from igadget.models import IGadget
from remoteChannel.models import RemoteChannel
from workspace.models import WorkSpace, Tab, AbstractVariable, WorkSpaceVariable, VariableValue


class ConnectableEntry(Resource):

    def read(self, request, workspace_id):
        get_user_authentication(request)
        wiring = {}

        try:
            igadgets = IGadget.objects.filter(tab__workspace__pk=workspace_id)
            igadget_data_list = get_wiring_data(igadgets)
            wiring['iGadgetList'] = igadget_data_list

            tabs = Tab.objects.filter(workspace__pk=workspace_id)
            wiring['tabList'] = [get_tab_data(tab) for tab in tabs]

        except WorkSpace.DoesNotExist:
            wiring['iGadgetList'] = []
            wiring['tabList'] = []

        # InOut list
        inouts = InOut.objects.filter(workspace__pk=workspace_id)
        wiring['inOutList'] = [get_inout_data(inout) for inout in inouts]

        # Filter list
        filters = Filter.objects.all()
        wiring['filterList'] = [get_filter_data(f) for f in filters]

        return HttpResponse(json_encode(wiring), mimetype='application/json; charset=UTF-8')

    @transaction.commit_on_success
    def create(self, request, workspace_id):
        user = get_user_authentication(request)

        workspace = get_object_or_404(WorkSpace, id=workspace_id)
        if not user.is_staff and workspace.creator != user:
            return HttpResponseForbidden()

        # Gets all needed parameters from request
        if 'json' in request.POST:
            json = simplejson.loads(request.POST['json'])
        else:
            return HttpResponseBadRequest(_(u'JSON parameter expected'))

        try:
            new_channels = json['inOutList']
            old_channels = InOut.objects.filter(workspace_variable__workspace=workspace)

            # Mapping between provisional ids and database-generated ids!!!
            id_mapping = {}

            # Hash for mapping External Channels URLs and IDs
            rchannels_urls_to_ids = []

            # A list of the channels removed by the user
            # Initially, all channels are considered to be deleted, and they
            # will be removed from this list if they appear in the inOuList
            # argument
            channelsDeletedByUser = old_channels[::1]

            # Disconnect all channels in the workspace
            for old_channel in old_channels:
                # Deleting the old relationships between channels
                # First delete the relationships where old_channel is the input
                rel_old_channels = RelatedInOut.objects.filter(in_inout=old_channel)
                for channel_delete in rel_old_channels:
                    channel_delete.delete()

                # And then the relationships where old_channel is the output
                rel_old_channels = RelatedInOut.objects.filter(out_inout=old_channel)
                for channel_delete in rel_old_channels:
                    channel_delete.delete()

                if old_channel.remote_subscription:
                    old_channel.remote_subscription.delete()

            # Adding channels recreating JSON structure!
            for channel_id in new_channels:
                new_channel_data = new_channels[channel_id]

                # Remote subscriptions!
                remote_subscription = None
                if new_channel_data.get('remote_subscription', None):
                    op_code = unicode(new_channel_data['remote_subscription']['op_code'])
                    url = new_channel_data['remote_subscription']['url']

                    if op_code != '0':
                        remote_channel, created = RemoteChannel.objects.get_or_create(url=url)

                        data = dict()
                        data['url'] = url
                        data['id'] = remote_channel.id

                        rchannels_urls_to_ids.append(data)

                        remote_subscription = RemoteSubscription(operation_code=op_code, remote_channel=remote_channel)
                        remote_subscription.save()

                if new_channel_data.get('provisional_id', False):
                    # It's necessary to create a new channel from scratch

                    filter = None
                    filter_params = None
                    if new_channel_data.get('filter_id', ''):
                        filter = Filter.objects.get(id=new_channel_data['filter_id'])
                        filter_params = new_channel_data['filter_params']
                    channel = createChannel(workspace, new_channel_data['name'], filter, filter_params, remote_subscription)

                    # A channel has been generated. It's necessary to correlate provisional and final ids!
                    id_mapping[new_channel_data['id']] = {'new_id': channel.id, 'new_wv_id': channel.workspace_variable.id}

                else:
                    channel = InOut.objects.get(id=channel_id)

                    workspace_variable = channel.workspace_variable
                    workspace_variable.abstract_variable.name = new_channel_data['name']
                    workspace_variable.abstract_variable.save()

                    filter = None
                    filter_params = ''
                    if new_channel_data.get('filter', ''):
                        filter = Filter.objects.get(id=new_channel_data['filter'])
                        filter_params = json_encode(new_channel_data['filter_params'])

                    channel.remote_subscription = remote_subscription
                    channel.name = new_channel_data['name']
                    channel.filter = filter
                    channel.filter_param_values = filter_params
                    channel.friend_code = ""
                    channel.save()

                    channelsDeletedByUser.remove(channel)

                # In connections
                # InOut out connections will be created later
                for inputId in new_channel_data.get('ins', []):
                    connectable = In.objects.get(id=inputId)
                    connectable.inouts.add(channel)
                    connectable.save()

                # Out connections
                # InOut out connections will be created later
                for outputId in new_channel_data.get('outs', []):
                    connectable = Out.objects.get(id=outputId)
                    connectable.inouts.add(channel)
                    connectable.save()

            # Now it is time to recreate channel to channel connections
            for channel_id in new_channels:
                new_channel_data = new_channels[channel_id]
                inout_id = new_channel_data['id']
                if new_channel_data['provisional_id']:
                    inout_id = id_mapping[inout_id]['new_id']
                channel = InOut.objects.get(id=inout_id)
                for inout_to_add in new_channel_data.get('inouts', []):
                    inout_id = inout_to_add['id']

                    # search final id if needed
                    if inout_to_add['provisional_id']:
                        inout_id = id_mapping[inout_id]['new_id']

                    relationship = RelatedInOut(in_inout=channel, out_inout=InOut.objects.get(id=inout_id))
                    relationship.save()

            # Erasing variables associated with channels deleted explicitly by the user
            for deleted_channel_id in channelsDeletedByUser:
                # Removing workspace_variable and abstract_variable of channels deleted explicitly by user
                deleteChannel(deleted_channel_id)

            json_result = {'ids': id_mapping, 'urls': rchannels_urls_to_ids}

            return HttpResponse(json_encode(json_result), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            msg = _('connectables cannot be saved: %(exc)s') % {'exc': e}
            raise TracedServerError(e, json, request, msg)

        return HttpResponse('ok')

    @transaction.commit_on_success
    def update(self, request, workspace_id):
        user = get_user_authentication(request)

        # Gets all needed parameters from request
        if 'json' in request.POST:
            json = simplejson.loads(request.POST['json'])
        else:
            return HttpResponseBadRequest(_(u'JSON parameter expected'))

        workspace = get_object_or_404(WorkSpace, id=workspace_id)
        if not user.is_staff and workspace.creator != user:
            return HttpResponseForbidden()

        id_mapping = {}

        # Phase 1: Additions
        channels_to_add = json['channelsToAdd']
        for new_channel in channels_to_add:
            # Creating the abstract variable for this channel
            new_abstract_variable = AbstractVariable(type="WORKSPACE", name=new_channel['name'])
            new_abstract_variable.save()

            # Creating the variable value entry for this channel
            new_variable_value = VariableValue(user=user, value="", abstract_variable=new_abstract_variable)
            new_variable_value.save()

            # And the workspace variable
            new_ws_variable = WorkSpaceVariable(workspace=workspace, abstract_variable=new_abstract_variable, aspect="CHANNEL")
            new_ws_variable.save()

            channel = InOut(name="", workspace_variable=new_ws_variable, filter=None, filter_param_values=None, friend_code="")
            channel.save()

            id_mapping[new_channel['id']] = {'cid': channel.id, 'wvid': new_ws_variable.id}

        # Phase 2: Updates
        channels_to_update = json['channelsToUpdate']
        for current_channel_data in channels_to_update:
            current_channel_id = current_channel_data['id']

            # search final id if needed
            if current_channel_data['provisional_id']:
                current_channel_id = id_mapping[current_channel_id]['cid']

            current_channel = InOut.objects.get(id=current_channel_data['id'])

            for input_to_add in current_channel_data['inputsToRemove']:
                connectable = In.objects.get(id=input_to_add['id'])
                connectable.inouts.add(current_channel)
                connectable.save()

            for input_to_remove in current_channel_data['inputsToRemove']:
                connectable = In.objects.get(id=input_to_add['id'])
                connectable.inouts.remove(current_channel)
                connectable.save()

            for output_to_add in current_channel_data['outputsToRemove']:
                connectable = Out.objects.get(id=output_to_add['id'])
                connectable.inouts.add(current_channel)
                connectable.save()

            for output_to_remove in current_channel_data['outputsToRemove']:
                connectable = Out.objects.get(id=output_to_add['id'])
                connectable.inouts.remove(current_channel)
                connectable.save()

            for inout_to_add in current_channel_data['inoutsToRemove']:
                inout_id = input_to_add['id']

                # search final id if needed
                if inout_to_add['provisional_id']:
                    inout_id = id_mapping[inout_id]['cid']

                relationship = RelatedInOut(in_inout=current_channel, out_inout=InOut.objects.get(id=inout_id))
                relationship.save()

            for output_to_remove in current_channel_data['outputsToRemove']:
                inout_id = input_to_add['id']

                # search final id if needed
                if inout_to_add['provisional_id']:
                    inout_id = id_mapping[inout_id]['cid']

                relationship = RelatedInOut.objects.get(in_inout=current_channel, out_inout=inout_id)
                relationship.delete()

        # Phase 3: Deletions
        channels_to_remove = json['channelsToRemove']
        for current_channel_data in channels_to_remove:
            channel = InOut.objects.get(id=current_channel_data['id'])
            deleteChannel(channel)

        json_result = {'id_mapping': id_mapping}
        return HttpResponse(json_encode(json_result), mimetype='application/json; charset=UTF-8')
