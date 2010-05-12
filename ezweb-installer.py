#!/usr/bin/python

import urllib2
import os
import sys

################
# CONSTANTS
################

EASY_INSTALL_URL = 'http://peak.telecommunity.com/dist/ez_setup.py'
EASY_INSTALL_FILENAME = 'ez_setup.py'

EZWEB_TRUNK = 'https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/src/trunk'

################
# METHODS
################

def ask_data_to_user():
  #Getting from user installation data
  
  data = {}

  print "Input installation directory for EzWeb:"
  ezweb_path = raw_input()

  data['EZWEB_ROOT'] = normalize_path(path=ezweb_path)

  print "Server name:"
  server_name = raw_input()

  data['SERVER_NAME'] = server_name

  print "Server port:"
  server_port = raw_input()

  data['SERVER_PORT'] = int(server_port)

  return data

def normalize_path(path, filename=''):
  full_path = path + "/" + filename

  full_path = os.path.normpath(full_path)

  # Checking directory
  dir = os.path.dirname(full_path)
  if not os.path.exists(dir):
    os.makedirs(dir)

  os.chdir(dir)
  
  return full_path


def download_file(url, filename, path):
  full_path = normalize_path(path, filename)

  conn = urllib2.urlopen(url)

  response = conn.read()

  file = open(full_path, 'wb')
  file.write(response)
  file.close() 

  return full_path

def install_pip(ezweb_path):
  #Downloading 'easy_install'
  download_file(EASY_INSTALL_URL, EASY_INSTALL_FILENAME, ezweb_path)

  #Installing 'easy_install'
  os.system('python %s' % EASY_INSTALL_FILENAME)

  #Installing 'pip'

  os.system('easy_install pip')

def load_data_model():
  os.system('python manage.py syncdb')

def install_dependencies():
  #Installing django

  os.system('pip install "django==1.0.4"')

def download_ezweb(ezweb_path):
  #Downloading EzWeb source code.
  #Running svn command line tool must be available
  os.system('svn co %s %s' % (EZWEB_TRUNK, ezweb_path))

def start_server(ezweb_path, server_name='', server_port=8000):
  #Running WSGI server
  from wsgiref.simple_server import make_server
  from django.core.handlers.wsgi import WSGIHandler
  from django.core.servers.basehttp import AdminMediaHandler

  os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

  sys.path.append(ezweb_path)
  
  httpd = make_server(server_name, server_port, AdminMediaHandler(WSGIHandler()))
  httpd.serve_forever()

def detect_platform(): 
  return sys.platform

def configure_path(platform):
  #Adding 'PYTHON_SCRIPTS' directory to os.environ (only if needed)

  if (platform == 'win32'):
    python_scripts_path = sys.exec_prefix + '\Scripts'
    os.environ['PATH'] =  python_scripts_path + os.pathsep + os.environ['PATH']


################
# MAIN METHOD
################
def main():
  platform = detect_platform()

  data = ask_data_to_user()

  ezweb_path = data['EZWEB_ROOT']
  server_name = data['SERVER_NAME']
  server_port = data['SERVER_PORT']

  configure_path(platform)
  install_pip(ezweb_path)

  install_dependencies()

  download_ezweb(ezweb_path)

  load_data_model()

  start_server(ezweb_path, server_name, server_port)
  exit()

##############################################
# INVOKING main() IF CALLED FROM COMMAND LINE
##############################################
if __name__ == '__main__':
  main()
