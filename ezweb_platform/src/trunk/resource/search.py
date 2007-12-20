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

