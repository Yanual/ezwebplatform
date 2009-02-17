package org.morfeo.ezweb.proxy;

import java.io.InputStream;
import java.net.URL;
import java.util.Properties;

import org.apache.log4j.Logger;

public class PropertiesUtils {

	private static Properties instance;
	
	/**
	 * Carga la configuracion
	 * @param propertiesPath Ruta relativa al classpath donde se encuentra el fichero de propiedades
	 * @param log Logger
	 */
	public static Properties instanceFromClasspath(String propertiesPath, Logger log) throws Exception {
	
		try {
			if (instance == null) {
				synchronized (PropertiesUtils.class) {
					if (instance == null) {
						instance = new Properties();
	
						if (propertiesPath != null) {
							URL url = Thread.currentThread()
									.getContextClassLoader().getResource(
											propertiesPath);
							if (url == null) {
								// Could not find resource on classpath
								log.error("No se encuentra el recurso: "
										+ propertiesPath + " en el classpath");
								throw new Exception(
										"Error de configuracion. No se encuentra el fichero: "
												+ propertiesPath,
										new Exception());
							}
							InputStream rf = url.openStream();
							if (rf == null) {
								// Failed opening stream for this resource
								log.error("Error al leer el recurso: "
										+ propertiesPath);
								throw new Exception(
										"Error de configuracion. No se puede leer el fichero: "
												+ propertiesPath,
										new Exception());
							}
	
							instance.load(rf);
							rf.close();
							log.debug("Configuracion cargada OK: "
									+ url.getFile());
						} else {
							log.debug("Cargando configuracion por defecto");
						}
	
						log.debug("[" + instance + "]");
	
					}
				}
			}
			return instance;
		} catch (Exception e) {
			throw new Exception(
					"No existe fichero de definición de menú de operaciones", e);
		}
	
	}

}
