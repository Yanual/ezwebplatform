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

class AndCondition:

  def __init__(self):
    self.conditions = []

  def append(self, condition):
    self.conditions.append(condition)

  def pass_check(self, site_cfg):
    valid = True
    for condition in self.conditions:
      if not condition.pass_check(site_cfg):
        valid = False
        break

    return valid

class NotCondition:

  def append(self, condition):
    self.realcondition = condition

  def pass_check(self, site_cfg):
    return not self.realcondition.pass_check(site_cfg)

class AllValidCondition:
  def pass_check(self, site_cfg):
    return True

class EnabledCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg.getDefaultAsBool(False, 'enabled') == self.compareStatus

class NameCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg['name'] == self.compareStatus

class SchemaCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg.getDefault('', 'schema') == self.compareStatus

class ServerCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg.getDefault('', 'server', 'server_type') == self.compareStatus

class ConnectionTypeCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg.getDefault('', 'server', 'connection_type') == self.compareStatus

class DatabaseEngineCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg.getDefault('', 'database', 'database_engine') == self.compareStatus

class HasAuthMethodCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return self.compareStatus in site_cfg.getDefault([], 'auth_methods')

class AuthMethodCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg.getDefault([], 'auth_methods') == self.compareStatus
