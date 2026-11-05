/**
 * Temario CCNAv7 ITN (Introducción a redes), basado en el PDF del curso.
 * Correcciones respecto al PDF:
 *  - El Módulo 5 del PDF repite los temas del Módulo 6; aquí se usan los temas oficiales (binario / hexadecimal).
 *  - Los títulos de los Módulos 16 y 17 aparecen intercambiados en el PDF; aquí se alinean con sus temas.
 */
export type Module = {
  id: number;
  title: string;
  /** Explicación en una frase, sin jerga, para alguien que empieza desde cero. */
  plain: string;
  lessons: [id: string, title: string][];
};

export const syllabus: Module[] = [
  { id: 1, title: "Las redes en la actualidad", plain: "Qué es una red y por qué todo lo que usas a diario depende de ellas.", lessons: [
    ["1.1", "Las redes afectan nuestras vidas"], ["1.2", "Componentes de la red"], ["1.3", "Topologías y representaciones de red"],
    ["1.4", "Tipos comunes de redes"], ["1.5", "Conexiones a Internet"], ["1.6", "Redes confiables"],
    ["1.7", "Tendencias de red"], ["1.8", "Seguridad de redes"], ["1.9", "El profesional de TI"]] },
  { id: 2, title: "Configuración básica de switches y terminales", plain: "Cómo \"hablarle\" a un equipo de red con comandos para darle instrucciones.", lessons: [
    ["2.1", "Acceso a Cisco IOS"], ["2.2", "Navegación IOS"], ["2.3", "La estructura de comandos"], ["2.4", "Configuración básica de dispositivos"],
    ["2.5", "Guardar las configuraciones"], ["2.6", "Puertos y direcciones"], ["2.7", "Configurar direccionamiento IP"], ["2.8", "Verificar la conectividad"]] },
  { id: 3, title: "Protocolos y modelos", plain: "Las reglas que siguen los equipos para entenderse, como un idioma común.", lessons: [
    ["3.1", "Las reglas"], ["3.2", "Protocolos"], ["3.3", "Suites de protocolos"], ["3.4", "Organizaciones estándares"],
    ["3.5", "Modelos de referencia (OSI y TCP/IP)"], ["3.6", "Encapsulamiento de datos"], ["3.7", "Acceso a los datos"]] },
  { id: 4, title: "Capa física", plain: "Los cables, la fibra y las ondas de Wi-Fi que transportan los bits.", lessons: [
    ["4.1", "Propósito de la capa física"], ["4.2", "Características de la capa física"], ["4.3", "Cableado de cobre"],
    ["4.4", "Cableado UTP"], ["4.5", "Cableado de fibra óptica"], ["4.6", "Medios inalámbricos"]] },
  { id: 5, title: "Sistemas numéricos", plain: "Contar como las computadoras: en ceros y unos (binario) y en hexadecimal.", lessons: [
    ["5.1", "Sistema numérico binario"], ["5.2", "Sistema numérico hexadecimal"]] },
  { id: 6, title: "Capa de enlace de datos", plain: "Cómo se empaquetan los datos para viajar de un equipo al de al lado.", lessons: [
    ["6.1", "Propósito de la capa de enlace de datos"], ["6.2", "Topologías"], ["6.3", "Trama de enlace de datos"]] },
  { id: 7, title: "Switching Ethernet", plain: "Cómo un switch sabe a qué puerto mandar cada mensaje dentro de tu red local.", lessons: [
    ["7.1", "Trama de Ethernet"], ["7.2", "Dirección MAC de Ethernet"], ["7.3", "La tabla de direcciones MAC"], ["7.4", "Velocidades y métodos de reenvío del switch"]] },
  { id: 8, title: "Capa de red", plain: "Cómo un paquete encuentra el camino entre redes distintas, como el correo postal.", lessons: [
    ["8.1", "Características de la capa de red"], ["8.2", "Paquete IPv4"], ["8.3", "Paquete IPv6"],
    ["8.4", "Cómo arma las rutas un host"], ["8.5", "Tablas de routing de router"]] },
  { id: 9, title: "Resolución de direcciones", plain: "Cómo se traduce una dirección IP a la dirección física (MAC) de un equipo.", lessons: [
    ["9.1", "MAC e IP"], ["9.2", "ARP"], ["9.3", "Detección de vecinos (IPv6)"]] },
  { id: 10, title: "Configuración básica de un router", plain: "Poner en marcha el equipo que conecta tu red con otras redes.", lessons: [
    ["10.1", "Parámetros iniciales del router"], ["10.2", "Configuración de interfaces"], ["10.3", "Configuración del gateway predeterminado"]] },
  { id: 11, title: "Asignación de direcciones IPv4", plain: "Las direcciones de 4 números (192.168.1.10) y cómo dividir una red en partes (subnetting).", lessons: [
    ["11.1", "Estructura de la dirección IPv4"], ["11.2", "Unidifusión, difusión y multidifusión"], ["11.3", "Tipos de direcciones IPv4"],
    ["11.4", "Segmentación de la red"], ["11.5", "División de subredes de una red IPv4"], ["11.6", "Subredes con prefijos /16 y /8"],
    ["11.7", "Subredes para cumplir con requisitos"], ["11.8", "Máscara de subred de longitud variable (VLSM)"], ["11.9", "Diseño estructurado"]] },
  { id: 12, title: "Asignación de direcciones IPv6", plain: "Las direcciones nuevas y larguísimas que existen porque se acabaron las de IPv4.", lessons: [
    ["12.1", "Problemas con IPv4"], ["12.2", "Asignación de direcciones IPv6"], ["12.3", "Tipos de direcciones IPv6"],
    ["12.4", "Configuración estática de GUA y LLA"], ["12.5", "Direccionamiento dinámico para GUA"], ["12.6", "Direccionamiento dinámico para LLA"],
    ["12.7", "Direcciones IPv6 de multidifusión"], ["12.8", "División de subredes IPv6"]] },
  { id: 13, title: "ICMP", plain: "Los mensajes de diagnóstico: ping y traceroute para saber si algo responde.", lessons: [
    ["13.1", "Mensajes ICMP"], ["13.2", "Pruebas de ping y traceroute"]] },
  { id: 14, title: "Capa de transporte", plain: "TCP y UDP: entregar datos completos y en orden, o rápido aunque se pierda algo.", lessons: [
    ["14.1", "Transporte de datos"], ["14.2", "Descripción general de TCP"], ["14.3", "Descripción general de UDP"], ["14.4", "Números de puerto"],
    ["14.5", "Proceso de comunicación TCP"], ["14.6", "Confiabilidad y control de flujo"], ["14.7", "Comunicación UDP"]] },
  { id: 15, title: "Capa de aplicación", plain: "Los servicios que sí ves: web, correo, DNS, DHCP y compartir archivos.", lessons: [
    ["15.1", "Aplicación, presentación y sesión"], ["15.2", "Punto a punto"], ["15.3", "Protocolos web y de correo electrónico"],
    ["15.4", "Servicios de direccionamiento IP"], ["15.5", "Servicios de intercambio de archivos"]] },
  { id: 16, title: "Fundamentos de seguridad de la red", plain: "Quién ataca una red, cómo lo hace y cómo protegerla.", lessons: [
    ["16.1", "Vulnerabilidades y amenazas a la seguridad"], ["16.2", "Ataques a la red"],
    ["16.3", "Mitigación de los ataques a la red"], ["16.4", "Seguridad de los dispositivos"]] },
  { id: 17, title: "Cree una red pequeña", plain: "Juntar todo lo aprendido para armar y reparar la red de una oficina.", lessons: [
    ["17.1", "Dispositivos de una red pequeña"], ["17.2", "Protocolos y aplicaciones de redes pequeñas"], ["17.3", "Escalamiento hacia redes más grandes"],
    ["17.4", "Verificar la conectividad"], ["17.5", "Comandos de host y de IOS"], ["17.6", "Metodologías para la solución de problemas"],
    ["17.7", "Escenarios de resolución de problemas"]] },
];
