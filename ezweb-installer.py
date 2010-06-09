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

def print_step(text):
  print ""
  print "#####################"
  print "# " + text
  print "#####################"

def install_pip(ezweb_path):
  print_step('Installing pip');

  #Downloading 'easy_install'
  download_file(EASY_INSTALL_URL, EASY_INSTALL_FILENAME, ezweb_path)

  #Installing 'easy_install'
  os.system('python %s' % EASY_INSTALL_FILENAME)

  #Installing 'pip'

  os.system('easy_install pip')

def install_virtualenv():
  print_step('Installing virtualenv')

  os.system('pip install -U virtualenv')

def create_virtual_env(name):
  print_step('Creating a virtual env for EzWeb')

  os.system('virtualenv --no-site-packages %s' % name)

def install_dependencies(venv):

  print_step('Installing EzWeb dependencies')

  # Installing django

  os.system('pip install -E %s https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/lib/Django-1.0.4.tar.gz' % venv)

  os.system('pip install -E %s https://svn.forge.morfeo-project.org/svn/ezwebplatform/ezweb_platform/lib/facebook-tornado.tar.gz' % venv)

def download_ezweb(ezweb_path):

  print_step('Downloading EzWeb source code from SVN (this may take some time)')

  #Downloading EzWeb source code.
  #Running svn command line tool must be available
  os.system('svn co -q %s %s' % (EZWEB_TRUNK, ezweb_path))

def load_data(ezweb_path):
  print_step('Initializing EzWeb db')

  if sys.platform == 'win32':
    python_interpreter = os.path.join(ezweb_path, 'python-env', 'Scripts', 'python.exe')
  else:
    python_interpreter = os.path.join(ezweb_path, 'python-env', 'bin', 'python')

  script = os.path.join(ezweb_path, 'bin', 'update.py')
  os.system('%s %s --only-db' % (python_interpreter, script))

def escape(text):
  return text.replace("'", "\\'").replace("\n", "\\\n")

def save_config(fileName, server_name, server_port):
  cfg  = "SERVER_NAME = '%s'\n" % escape(server_name)
  cfg += "SERVER_PORT = %d\n" % server_port
  file = open(fileName, 'wb')
  file.write(cfg)
  file.close()

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
  env_path = os.path.join(ezweb_path, 'python-env')

  configure_path(platform)
  install_pip(ezweb_path)
  install_virtualenv()
  create_virtual_env(env_path)

  install_dependencies(env_path)

  download_ezweb(ezweb_path)

  save_config(os.path.join(ezweb_path, 'config.py'), server_name, server_port)

  load_data(ezweb_path)

  print_step('EzWeb installed sucessfully')

  exit()

##############################################
# INVOKING main() IF CALLED FROM COMMAND LINE
##############################################
if __name__ == '__main__':
  main()
