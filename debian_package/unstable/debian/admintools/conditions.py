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
    return site_cfg.as_bool('enabled') == self.compareStatus

class NameCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    return site_cfg['name'] == self.compareStatus

class ServerCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    if site_cfg['server'].has_key("server_type"):
      return site_cfg['server']['server_type'] == self.compareStatus
    else:
      return self.compareStatus == ""

class ConnectionTypeCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    if site_cfg['server'].has_key("connection_type"):
      return site_cfg['server']['connection_type'] == self.compareStatus
    else:
      return self.compareStatus == ""

class DatabaseEngineCondition:

  def __init__(self, compareStatus):
    self.compareStatus = compareStatus

  def pass_check(self, site_cfg):
    if site_cfg['database'].has_key("database_engine"):
      return site_cfg['database']['database_engine'] == self.compareStatus
    else:
      return self.compareStatus == ""
