/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */


# Implements a Full Text Search over a model
from django.db import models, backend

class SearchQuerySet(models.query.QuerySet):
	def __init__(self, model=None, fields=None):
		super(SearchQuerySet, self).__init__(model)
		self._search_fields = fields
        
	def search(self, query):
		# create query tsearch2 to execute
		match_expr = ""
		for name in self._search_fields:
			match_expr += name
			match_expr += " @@ to_tsquery('default', '"
			match_expr += query 
			match_expr += "') OR "
		
		
		return self.extra(where=[match_expr[:-3]])
        
class SearchManager(models.Manager):
	def __init__(self, fields):
		super(SearchManager, self).__init__()
		self._search_fields = fields

	def get_query_set(self):
		# query
		return SearchQuerySet(self.model, self._search_fields)

	def search(self, query):
		# execute
		return self.get_query_set().search(query)

