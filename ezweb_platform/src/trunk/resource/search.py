# Implementa una busqueda Full Text Search sobre un modelo concreto
from django.db import models
import os

class SearchQuerySet(models.query.QuerySet):
	def __init__(self, model=None, fields=None):
		super(SearchQuerySet, self).__init__(model)
		self._search_fields = fields
        
	def search(self, query):
		match_expr = ""
		# enlazamos tantos 'concat' como sean necesarios
		for i in range(0, len(self._search_fields)-1):
			match_expr += "concat("
		first = 0 # determina si es el primer campo
		# construccion de la consulta
		for name in self._search_fields:
			match_expr += name
			if first == 0: 
				match_expr += ", "
				first = 1
			else: match_expr += "), "
		match_expr = match_expr[:-2]
		match_expr += " @@ to_tsquery('default', '"	
		match_expr += query 
		match_expr += "')"
		# devolucion de la consulta preparada
		return self.extra(where=[match_expr])
        
class SearchManager(models.Manager):
	def __init__(self, table, fields):
		super(SearchManager, self).__init__()
		self._search_fields = self.attachFTI(table, fields)
	
	# crea el script para la creacion del SQL de tsearch2
	# y lo ata con los campos que le hemos pasado
	def attachFTI(self, table, flds):
		app = table.split('_')[0] # aplicacion que estamos tratando
		model = table.split('_')[1] # modelo que estamos tratando
		# creacion del directorio donde ira el script
		dir = os.path.abspath(app + '/sql')
		if not(os.path.exists(dir) or os.path.isdir(dir)):
			os.mkdir (dir)
		complete_fields = [] # lista con los campos con el _fti
		# apertura de fichero
		f = open(dir + '/' + model + '.sql', 'a')
		for name in flds: # creacion del script
			f.write("/* CREACION DE CAMPOS tsearch2 PARA " + name + " */\n")
			f.write("ALTER TABLE " + table + " ADD COLUMN " + name + "_fti tsvector;\n")
			f.write("UPDATE " + table + " SET " + name + "_fti=to_tsvector('default', " + name + ");\n")
			f.write("CREATE INDEX " + name + "_fti_idx ON " + table + " USING gist(" + name + "_fti);\n")
			f.write("CREATE TRIGGER " + name + "_fti_updt\n" +
				"BEFORE UPDATE OR INSERT ON " + table +
				" \nFOR EACH ROW EXECUTE PROCEDURE\n" +
				"tsearch2(" + name + "_fti, " + name + ");\n\n")
			complete_fields.append(name + "_fti")
		f.write("ANALYZE " + table + ";\n")
		f.close()
		return complete_fields # devolvemos los campos con el _fti
		
	def get_query_set(self):
		# preparacion de la consulta
		return SearchQuerySet(self.model, self._search_fields)

	def search(self, query):
		# ejecucion de la consulta
		return self.get_query_set().search(query)
