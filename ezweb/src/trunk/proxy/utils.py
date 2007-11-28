

def is_valid_header (header):
	if (header == 'connection') or (header== 'keep-alive') or (header == 'proxy-authenticate') or (header == 'proxy-authorization') or (header == 'te') or (header == 'trailers') or (header == 'transfer-encoding') or (header == 'upgrade'):
	     return False
	else:
	     return True
