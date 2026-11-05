/**
 * Banco de preguntas ORIGINALES por módulo del CCNA 1 (ITN).
 * Redactadas para este proyecto en lenguaje sencillo, con el estilo de los exámenes del curso
 * (opción única y "Elige dos") y una explicación didáctica en cada una.
 */
export type Question = {
  id: string;
  module: number;
  prompt: string;
  options: string[];
  correct: number[];   // índices de las opciones correctas
  explain: string;
};

const bank: Question[] = [];
let mod = 0, n = 0;
const M = (m: number) => { mod = m; n = 0; };
const q = (prompt: string, options: string[], correct: number | number[], explain: string) => {
  n++;
  bank.push({ id: `m${mod}-${String(n).padStart(2, "0")}`, module: mod, prompt, options, correct: Array.isArray(correct) ? correct : [correct], explain });
};

/* ───────────── Módulo 1 · Las redes en la actualidad ───────────── */
M(1);
q("¿Cuál de estos es un dispositivo final (host)?", ["Una laptop", "Un switch", "Un router", "Un firewall"], 0,
  "Los dispositivos finales son los que originan o reciben los mensajes, como laptops, teléfonos o servidores. Switches, routers y firewalls son dispositivos intermediarios.");
q("¿Qué tipo de red cubre un área pequeña, como una casa, una escuela o una oficina?", ["LAN", "WAN", "MAN", "Internet"], 0,
  "LAN (red de área local) cubre un área pequeña y normalmente la administra una sola organización.");
q("¿Qué tipo de red conecta LANs separadas por grandes distancias, normalmente usando un proveedor de servicios?", ["WAN", "LAN", "WLAN", "PAN"], 0,
  "Una WAN (red de área extensa) une LANs de distintas ciudades o países, casi siempre con enlaces de un proveedor.");
q("¿Qué característica de una red confiable permite que siga funcionando si falla un enlace?", ["Tolerancia a fallas", "Escalabilidad", "Calidad de servicio", "Seguridad"], 0,
  "La tolerancia a fallas se logra con caminos redundantes: si uno falla, el tráfico usa otro.");
q("¿Qué significa la tendencia BYOD?", ["Que las personas usen sus propios dispositivos en la red de la escuela o empresa", "Comprar equipos de red de un solo fabricante", "Bloquear todos los dispositivos personales", "Usar solo cables en lugar de Wi-Fi"], 0,
  "BYOD (Bring Your Own Device) significa 'trae tu propio dispositivo': usar tu teléfono o laptop personal para estudiar o trabajar.");
q("Una empresa deja que sus proveedores entren de forma segura a una parte de su red privada. ¿Cómo se llama esto?", ["Extranet", "Intranet", "Internet", "LAN inalámbrica"], 0,
  "La intranet es solo para los miembros de la organización; la extranet extiende parte de ella a socios externos como proveedores.");
q("¿Qué mecanismo da prioridad a una videollamada sobre la descarga de un archivo?", ["Calidad de servicio (QoS)", "Tolerancia a fallas", "Escalabilidad", "Direccionamiento IP"], 0,
  "QoS clasifica el tráfico y atiende primero al sensible al retraso, como voz y video.");
q("¿Cuáles son dos formas comunes de conectar una CASA a Internet? (Elige dos.)", ["Cable", "DSL", "Metro Ethernet", "Línea arrendada dedicada"], [0, 1],
  "En casa son comunes el cable (de la TV) y DSL (línea telefónica). Metro Ethernet y las líneas dedicadas son opciones empresariales.");

/* ───────────── Módulo 2 · Configuración básica ───────────── */
M(2);
q("¿Qué comando lleva del modo EXEC usuario al modo EXEC privilegiado?", ["enable", "configure terminal", "exit", "privilege"], 0,
  "enable sube del modo usuario (>) al modo privilegiado (#).");
q("¿Qué prompt indica que estás en el modo EXEC privilegiado?", ["Switch#", "Switch>", "Switch(config)#", "Switch(config-if)#"], 0,
  "El símbolo # sin '(config)' indica modo EXEC privilegiado. '>' es modo usuario.");
q("¿En qué modo se cambia el nombre (hostname) de un switch?", ["Configuración global", "EXEC usuario", "EXEC privilegiado", "Configuración de interfaz"], 0,
  "hostname se escribe en el modo de configuración global: Switch(config)#.");
q("¿Dónde se guarda la configuración en uso (running-config)?", ["En la RAM", "En la NVRAM", "En la memoria flash", "En la ROM"], 0,
  "running-config está en la RAM y se pierde al apagar. La startup-config se guarda en la NVRAM.");
q("¿Qué comando guarda la configuración para que siga ahí después de reiniciar?", ["copy running-config startup-config", "show running-config", "reload", "erase startup-config"], 0,
  "Copiar la running-config a la startup-config la guarda en la NVRAM, que no se borra al apagar.");
q("¿Para qué sirve configurar una IP en la interfaz VLAN 1 (SVI) de un switch?", ["Para administrarlo a distancia (por ejemplo, con SSH)", "Para que el switch enrute entre redes", "Para que las PCs obtengan IP", "Para encender los puertos"], 0,
  "El switch de capa 2 no necesita IP para reenviar tramas; la SVI es solo para administrarlo remotamente.");
q("¿Qué comando cifra todas las contraseñas que aparecen en texto plano en la configuración?", ["service password-encryption", "enable secret", "password cisco", "crypto key generate rsa"], 0,
  "service password-encryption oculta las contraseñas en texto plano para que no se lean al ver la configuración.");
q("¿Cuáles son dos formas de acceder a la CLI de un switch Cisco? (Elige dos.)", ["Por el puerto de consola", "Por SSH", "Por el puerto de alimentación", "Por DNS"], [0, 1],
  "Se puede entrar por consola (cable directo al equipo) o de forma remota con SSH (o Telnet, que no es seguro).");

/* ───────────── Módulo 3 · Protocolos y modelos ───────────── */
M(3);
q("¿Cuántas capas tiene el modelo OSI?", ["7", "4", "5", "8"], 0,
  "El modelo OSI tiene 7 capas: física, enlace de datos, red, transporte, sesión, presentación y aplicación.");
q("¿Cuántas capas tiene el modelo TCP/IP?", ["4", "7", "3", "5"], 0,
  "TCP/IP tiene 4 capas: acceso a la red, Internet, transporte y aplicación.");
q("¿Cómo se llama el proceso de agregar encabezados a los datos mientras bajan por las capas?", ["Encapsulamiento", "Desencapsulamiento", "Segmentación", "Multiplexación"], 0,
  "Encapsular es agregar información de control (encabezados) en cada capa al enviar.");
q("¿Cómo se llama la unidad de datos (PDU) en la capa de transporte?", ["Segmento", "Paquete", "Trama", "Bits"], 0,
  "Transporte = segmento, red = paquete, enlace de datos = trama, física = bits.");
q("¿Qué organización crea los estándares de Ethernet (802.3) y Wi-Fi (802.11)?", ["IEEE", "IETF", "ICANN", "ISO"], 0,
  "El IEEE desarrolla los estándares 802 (Ethernet, Wi-Fi). El IETF desarrolla los protocolos de Internet (RFC).");
q("¿En qué capa del modelo OSI trabaja un router?", ["Red (capa 3)", "Enlace de datos (capa 2)", "Transporte (capa 4)", "Física (capa 1)"], 0,
  "El router decide rutas usando direcciones IP: capa 3, red.");
q("¿Qué dirección se usa para entregar una trama a otro equipo dentro de la MISMA red local?", ["La dirección MAC", "La dirección IP pública", "El número de puerto", "El nombre de dominio"], 0,
  "Dentro de la LAN, la trama se entrega usando la MAC de destino (capa 2).");
q("¿Qué dos capas del modelo OSI corresponden a la capa de acceso a la red de TCP/IP? (Elige dos.)", ["Enlace de datos", "Física", "Red", "Transporte"], [0, 1],
  "La capa de acceso a la red de TCP/IP equivale a las capas 1 (física) y 2 (enlace de datos) de OSI.");

/* ───────────── Módulo 4 · Capa física ───────────── */
M(4);
q("¿Qué medio NO se ve afectado por la interferencia electromagnética?", ["Fibra óptica", "UTP", "Cable coaxial", "STP"], 0,
  "La fibra transmite luz, no electricidad, por eso es inmune a la interferencia electromagnética.");
q("¿Por qué los pares de cobre de un cable UTP vienen trenzados?", ["Para cancelar la interferencia y la diafonía", "Para que el cable sea más resistente", "Para transmitir luz", "Para identificar los colores"], 0,
  "El trenzado hace que el ruido afecte por igual a ambos hilos y se cancele (efecto de cancelación).");
q("¿Qué cable se usa normalmente para conectar una PC a un switch?", ["Directo", "Cruzado", "De consola", "Coaxial"], 0,
  "Entre dispositivos de distinto tipo (PC ↔ switch) se usa cable directo.");
q("¿Qué tipo de fibra usa láser y alcanza las distancias más largas?", ["Monomodo", "Multimodo", "UTP categoría 6", "Coaxial"], 0,
  "La fibra monomodo tiene un núcleo muy delgado, usa láser y llega a decenas de kilómetros. La multimodo usa LED y alcanza menos distancia.");
q("¿Cómo se llama la velocidad REAL de transferencia que se mide en una red?", ["Rendimiento (throughput)", "Ancho de banda", "Latencia", "Atenuación"], 0,
  "El ancho de banda es la capacidad teórica; el rendimiento (throughput) es lo que realmente se logra.");
q("¿Qué conector se usa en los cables UTP de red?", ["RJ-45", "RJ-11", "SC", "BNC"], 0,
  "RJ-45 es el conector de 8 pines de los cables Ethernet. RJ-11 es de teléfono y SC es de fibra.");
q("¿Qué estándar del IEEE define las redes Wi-Fi?", ["802.11", "802.3", "802.15", "802.1Q"], 0,
  "802.11 es Wi-Fi, 802.3 es Ethernet y 802.15 es Bluetooth.");
q("¿Qué dos tipos de interferencia pueden afectar al cableado de cobre? (Elige dos.)", ["EMI (electromagnética)", "RFI (radiofrecuencia)", "Dispersión de la luz", "Reflexión interna total"], [0, 1],
  "El cobre sufre EMI y RFI (y diafonía). La dispersión y la reflexión total interna son conceptos de la fibra óptica.");

/* ───────────── Módulo 5 · Sistemas numéricos ───────────── */
M(5);
q("¿Cuánto es 11000000 (binario) en decimal?", ["192", "128", "224", "160"], 0,
  "Los bits encendidos son los de valor 128 y 64: 128 + 64 = 192. Es el primer octeto de las redes 192.168.x.x.");
q("¿Cuál es el número binario de 172?", ["10101100", "10110100", "11001010", "10101010"], 0,
  "172 = 128 + 32 + 8 + 4 → 10101100.");
q("¿Cuánto es 0x2F en decimal?", ["47", "32", "42", "215"], 0,
  "2 × 16 + F (15) = 32 + 15 = 47.");
q("¿Cuántos bits tiene una dirección IPv4?", ["32", "64", "128", "48"], 0,
  "IPv4 tiene 32 bits, en 4 octetos de 8 bits. IPv6 tiene 128 y una MAC 48.");
q("¿Cuántos bits representa un solo dígito hexadecimal?", ["4", "8", "2", "16"], 0,
  "Un dígito hexadecimal va de 0 a F (0 a 15), que se escribe con 4 bits.");
q("¿Cuál es el valor decimal de 11111111?", ["255", "256", "128", "511"], 0,
  "128+64+32+16+8+4+2+1 = 255, el valor máximo de un octeto.");
q("¿Qué sistema numérico se usa para escribir las direcciones IPv6?", ["Hexadecimal", "Binario", "Decimal", "Octal"], 0,
  "IPv6 se escribe en 8 grupos de 4 dígitos hexadecimales.");
q("¿Qué dos valores equivalen al número decimal 100? (Elige dos.)", ["01100100 (binario)", "0x64 (hexadecimal)", "0x46 (hexadecimal)", "10010110 (binario)"], [0, 1],
  "100 = 64 + 32 + 4 → 01100100. En hexadecimal: 6 × 16 + 4 = 100 → 0x64.");

/* ───────────── Módulo 6 · Capa de enlace de datos ───────────── */
M(6);
q("¿Cuáles son las dos subcapas de la capa de enlace de datos en Ethernet?", ["LLC y MAC", "TCP e IP", "Física y lógica", "Sesión y transporte"], 0,
  "LLC (control de enlace lógico) habla con la capa de red y MAC (control de acceso al medio) con el hardware.");
q("¿Qué campo de la trama permite detectar si llegó con errores?", ["FCS (secuencia de verificación de trama)", "Preámbulo", "Tipo", "Dirección MAC de origen"], 0,
  "El FCS es un cálculo (CRC) que el receptor repite: si no coincide, la trama se descarta.");
q("¿Qué topología muestra cómo están conectados físicamente los cables y los equipos?", ["Topología física", "Topología lógica", "Topología de aplicación", "Topología de transporte"], 0,
  "La física muestra cables y ubicaciones; la lógica muestra cómo fluyen los datos.");
q("¿En qué modo un equipo puede enviar o recibir, pero no ambas cosas al mismo tiempo?", ["Half-duplex", "Full-duplex", "Simplex de enlace", "Multiplexado"], 0,
  "Half-duplex es como un walkie-talkie: un sentido a la vez. Full-duplex es como una llamada telefónica.");
q("¿En qué tipo de red se usa CSMA/CD?", ["Ethernet half-duplex antigua (con hubs)", "Wi-Fi", "Fibra óptica full-duplex", "Enlaces WAN punto a punto"], 0,
  "CSMA/CD detecta colisiones en Ethernet half-duplex. Las redes modernas con switches y full-duplex ya no lo necesitan.");
q("¿Qué método de acceso al medio usan las redes Wi-Fi?", ["CSMA/CA", "CSMA/CD", "Paso de token", "Ninguno"], 0,
  "Wi-Fi usa CSMA/CA: intenta EVITAR las colisiones porque no puede detectarlas mientras transmite.");
q("¿Qué topología WAN conecta cada sitio directamente con todos los demás?", ["Malla completa", "Estrella (hub and spoke)", "Punto a punto", "Bus"], 0,
  "En malla completa hay un enlace entre cada par de sitios: máxima redundancia, pero más costosa.");
q("¿Qué dos datos van en el encabezado de una trama Ethernet? (Elige dos.)", ["MAC de destino", "MAC de origen", "Dirección IP de destino", "Número de puerto"], [0, 1],
  "El encabezado Ethernet lleva las MAC de destino y origen (y el tipo). Las IP van en el paquete y los puertos en el segmento.");

/* ───────────── Módulo 7 · Switching Ethernet ───────────── */
M(7);
q("¿Cuál es el tamaño mínimo de una trama Ethernet?", ["64 bytes", "1518 bytes", "32 bytes", "128 bytes"], 0,
  "Una trama Ethernet mide entre 64 y 1518 bytes. Las más pequeñas se consideran fragmentos de colisión ('runts').");
q("¿Qué dirección examina el switch para APRENDER en qué puerto está cada equipo?", ["La MAC de origen", "La MAC de destino", "La IP de origen", "La IP de destino"], 0,
  "El switch anota la MAC de origen junto con el puerto por donde llegó la trama.");
q("¿Qué hace un switch si la MAC de destino NO está en su tabla?", ["La inunda por todos los puertos excepto el de entrada", "La descarta", "La devuelve al origen", "Le pregunta al router"], 0,
  "Si no sabe dónde está el destino, la envía por todos los puertos menos por el que llegó (inundación).");
q("¿Cuál es la dirección MAC de broadcast?", ["FF-FF-FF-FF-FF-FF", "00-00-00-00-00-00", "01-00-5E-00-00-01", "255.255.255.255"], 0,
  "FF-FF-FF-FF-FF-FF (todos los bits en 1) llega a todos los equipos de la LAN. 255.255.255.255 es el broadcast de IPv4, no una MAC.");
q("¿Qué identifican los primeros 24 bits (OUI) de una dirección MAC?", ["Al fabricante", "Al número de serie", "A la red", "Al puerto del switch"], 0,
  "El OUI lo asigna el IEEE a cada fabricante; los otros 24 bits los asigna el fabricante a cada tarjeta.");
q("¿Qué método de reenvío recibe la trama COMPLETA y revisa el FCS antes de enviarla?", ["Almacenamiento y envío (store-and-forward)", "Fast-forward", "Fragment-free", "Inundación"], 0,
  "Store-and-forward revisa toda la trama y descarta las que tienen errores.");
q("¿Qué método de reenvío tiene la MENOR latencia porque envía la trama apenas lee la MAC de destino?", ["Fast-forward (corte)", "Almacenamiento y envío", "Fragment-free", "Buffer compartido"], 0,
  "Fast-forward es el corte más rápido: solo lee la MAC de destino y empieza a reenviar.");
q("¿Qué dos cosas hace un switch al recibir una trama? (Elige dos.)", ["Anota la MAC de origen con su puerto", "Busca la MAC de destino en su tabla", "Cambia la IP de destino", "Elimina la MAC de origen"], [0, 1],
  "Primero aprende (MAC de origen → puerto) y luego decide el reenvío buscando la MAC de destino.");

/* ───────────── Módulo 8 · Capa de red ───────────── */
M(8);
q("¿Qué campo del encabezado IPv4 evita que un paquete circule para siempre?", ["TTL (tiempo de vida)", "Protocolo", "Versión", "Suma de comprobación"], 0,
  "Cada router resta 1 al TTL; cuando llega a 0, el paquete se descarta.");
q("¿Qué campo de IPv6 cumple la función del TTL de IPv4?", ["Límite de saltos (Hop Limit)", "Etiqueta de flujo", "Clase de tráfico", "Siguiente encabezado"], 0,
  "Hop Limit funciona igual que el TTL: baja en 1 en cada router.");
q("¿Qué significa que IP sea un protocolo 'de máximo esfuerzo'?", ["Que no garantiza la entrega de los paquetes", "Que siempre usa la ruta más rápida", "Que cifra los datos", "Que reenvía los paquetes perdidos"], 0,
  "IP intenta entregar, pero no confirma ni reenvía; de eso se encargan capas superiores como TCP.");
q("Una PC quiere enviar un paquete a un equipo de OTRA red. ¿A quién se lo envía primero?", ["A su gateway predeterminado", "Directo al destino", "Al servidor DNS", "Al switch para que lo enrute"], 0,
  "Si el destino está en otra red, la PC entrega el paquete a su gateway (el router de su LAN).");
q("En la tabla de routing de un router Cisco, ¿qué letra indica una red directamente conectada?", ["C", "S", "L", "O"], 0,
  "C = conectada, L = local (la IP de la propia interfaz), S = estática, O = OSPF.");
q("¿Qué ruta usa el router cuando ninguna otra coincide con el destino?", ["La ruta predeterminada 0.0.0.0/0", "La ruta de loopback", "La ruta de broadcast", "Ninguna: siempre descarta el paquete"], 0,
  "La ruta predeterminada coincide con cualquier destino; se usa como último recurso.");
q("¿Cuál es la dirección IPv4 de loopback que un equipo usa para probarse a sí mismo?", ["127.0.0.1", "192.168.0.1", "0.0.0.0", "169.254.0.1"], 0,
  "127.0.0.1 (todo el bloque 127.0.0.0/8) apunta al propio equipo.");
q("¿Qué dos campos se encuentran en el encabezado IPv4? (Elige dos.)", ["Dirección IP de origen", "TTL", "Número de puerto de destino", "Dirección MAC de destino"], [0, 1],
  "El encabezado IPv4 lleva las IP de origen/destino y el TTL, entre otros. Los puertos van en TCP/UDP y las MAC en la trama.");

/* ───────────── Módulo 9 · Resolución de direcciones ───────────── */
M(9);
q("¿Para qué sirve ARP?", ["Para encontrar la MAC que corresponde a una IPv4", "Para asignar direcciones IP", "Para traducir nombres a IP", "Para cifrar el tráfico"], 0,
  "ARP pregunta '¿quién tiene esta IP?' para conocer su MAC y poder armar la trama.");
q("¿Cómo se envía una solicitud ARP?", ["Como broadcast", "Como unicast al router", "Como multicast a los servidores", "No se envía, se calcula"], 0,
  "La solicitud ARP va a FF-FF-FF-FF-FF-FF porque aún no se conoce la MAC del destino.");
q("¿Cómo se envía la respuesta ARP?", ["Como unicast al equipo que preguntó", "Como broadcast", "Como multicast", "Por medio del DNS"], 0,
  "Solo responde el dueño de la IP, directo a quien preguntó.");
q("Una PC envía datos a un servidor de OTRA red. ¿De quién necesita la MAC?", ["Del gateway predeterminado", "Del servidor remoto", "Del servidor DNS", "Del switch"], 0,
  "La trama solo viaja dentro de la LAN: se dirige a la MAC del router (gateway), que luego la reenvía.");
q("¿Qué usa IPv6 en lugar de ARP?", ["Detección de vecinos (ND) con ICMPv6", "DHCPv6", "DNS", "NAT64"], 0,
  "IPv6 usa mensajes ICMPv6 de solicitud y anuncio de vecino (NS/NA).");
q("¿Qué comando de Windows muestra la tabla (caché) ARP?", ["arp -a", "ipconfig /all", "netstat -r", "tracert"], 0,
  "arp -a muestra las parejas IP ↔ MAC que el equipo recuerda.");
q("¿Qué ataque consiste en responder ARP con mentiras para hacerse pasar por el gateway?", ["Suplantación (envenenamiento) ARP", "Phishing", "Fuerza bruta", "Desbordamiento de búfer"], 0,
  "Con ARP spoofing el atacante hace que las víctimas le envíen el tráfico a él.");
q("¿Qué dos mensajes ICMPv6 se usan para resolver direcciones en IPv6? (Elige dos.)", ["Solicitud de vecino (NS)", "Anuncio de vecino (NA)", "Solicitud de eco", "Solicitud ARP"], [0, 1],
  "NS pregunta por la MAC de una IPv6 y NA responde. El eco es de ping y ARP no existe en IPv6.");

/* ───────────── Módulo 10 · Configuración básica de un router ───────────── */
M(10);
q("¿Qué comando enciende una interfaz de router?", ["no shutdown", "enable", "interface up", "ip enable"], 0,
  "Las interfaces del router vienen apagadas; no shutdown las activa.");
q("¿Qué comando muestra un resumen de las interfaces con su IP y estado?", ["show ip interface brief", "show running-config", "show version", "show ip route"], 0,
  "show ip interface brief es la forma más rápida de ver IPs y si están 'up'.");
q("¿Qué comando configura un mensaje de advertencia que se muestra al conectarse?", ["banner motd", "description", "hostname", "login"], 0,
  "banner motd # Acceso solo autorizado # muestra el aviso legal al conectarse.");
q("¿Qué IP deben usar las PCs de una LAN como gateway predeterminado?", ["La IP de la interfaz del router en esa LAN", "La IP del servidor DNS", "La IP de la propia PC", "La dirección de broadcast de la red"], 0,
  "El gateway es la interfaz del router que está en la misma red que las PCs.");
q("En un switch de capa 2, ¿para qué se configura 'ip default-gateway'?", ["Para poder administrarlo desde otra red", "Para que enrute entre VLANs", "Para dar IP a las PCs", "Para encender sus puertos"], 0,
  "El gateway del switch solo sirve para que su tráfico de administración salga de su red.");
q("Por defecto, ¿cómo están las interfaces de un router Cisco?", ["Administrativamente apagadas", "Encendidas y con IP", "Encendidas sin IP", "En modo troncal"], 0,
  "Las interfaces del router inician apagadas (administratively down) hasta usar no shutdown.");
q("¿Qué comando agrega un texto que explica para qué es una interfaz?", ["description", "banner", "remark", "name"], 0,
  "description Enlace al switch del laboratorio ayuda a documentar la red.");
q("¿Qué dos condiciones debe cumplir la interfaz del router que sirve de gateway a una LAN? (Elige dos.)", ["Tener una IP de la misma red que la LAN", "Estar encendida (no shutdown)", "Tener la misma MAC que las PCs", "Usar la dirección de broadcast"], [0, 1],
  "Debe estar en la misma red que las PCs y estar activa; si no, las PCs no pueden salir de su red.");

/* ───────────── Módulo 11 · Asignación de direcciones IPv4 ───────────── */
M(11);
q("¿A qué red pertenece el host 192.168.10.77/26?", ["192.168.10.64", "192.168.10.0", "192.168.10.72", "192.168.10.128"], 0,
  "Con /26 los bloques son de 64: 0, 64, 128, 192. El 77 cae en el bloque que empieza en 64.");
q("¿Cuántos hosts utilizables tiene una red /27?", ["30", "32", "62", "14"], 0,
  "32 − 27 = 5 bits de host → 2⁵ = 32 direcciones − 2 (red y broadcast) = 30.");
q("¿Cuál es la máscara de subred de un prefijo /20?", ["255.255.240.0", "255.255.255.240", "255.255.224.0", "255.240.0.0"], 0,
  "20 bits en 1: 255.255 (16) + 4 bits más (128+64+32+16 = 240) → 255.255.240.0.");
q("¿Cuál de estas direcciones es PRIVADA?", ["172.20.5.1", "172.32.1.1", "11.0.0.1", "192.169.1.1"], 0,
  "El rango privado 172 va de 172.16.0.0 a 172.31.255.255. 172.32 ya es pública.");
q("¿Qué tipo de transmisión envía un mensaje a TODOS los equipos de la red?", ["Broadcast (difusión)", "Unicast", "Multicast", "Anycast"], 0,
  "Broadcast = a todos; unicast = a uno; multicast = a un grupo.");
q("Una PC tiene la IP 169.254.33.10. ¿Qué significa?", ["No pudo obtener IP de un servidor DHCP", "Está conectada a Internet", "Tiene una IP pública", "Es la dirección del router"], 0,
  "169.254.x.x es APIPA: la PC se la asigna sola cuando no le responde ningún DHCP.");
q("¿Para qué sirve VLSM (máscara de subred de longitud variable)?", ["Para usar máscaras distintas según el tamaño de cada subred y no desperdiciar direcciones", "Para traducir IP privadas a públicas", "Para asignar IP automáticamente", "Para unir varias redes en una sola"], 0,
  "Con VLSM, un enlace de 2 routers usa /30 y una LAN grande usa /24, en lugar de la misma máscara para todo.");
q("¿Cuántas subredes /26 caben en una red /24?", ["4", "2", "8", "64"], 0,
  "Se toman 2 bits prestados (26 − 24): 2² = 4 subredes de 64 direcciones.");
q("En la red 192.168.1.0/24, ¿qué dos direcciones NO se pueden asignar a un equipo? (Elige dos.)", ["192.168.1.0", "192.168.1.255", "192.168.1.1", "192.168.1.254"], [0, 1],
  "La primera es la dirección de red y la última es la de broadcast; no se asignan a hosts.");

/* ───────────── Módulo 12 · Asignación de direcciones IPv6 ───────────── */
M(12);
q("¿Cuántos bits tiene una dirección IPv6?", ["128", "64", "32", "256"], 0,
  "IPv6 usa 128 bits, escritos en 8 grupos de 4 dígitos hexadecimales.");
q("¿Cuál es la forma abreviada correcta de 2001:0db8:0000:0000:0000:0000:0000:0001?", ["2001:db8::1", "2001:db8:0::0:1", "2001:db8::0001::", "21:db8::1"], 0,
  "Se quitan los ceros a la izquierda (0db8 → db8) y el bloque de ceros se cambia UNA vez por ::.");
q("¿Con qué prefijo empiezan las direcciones IPv6 link-local (LLA)?", ["FE80::/10", "2000::/3", "FF00::/8", "::1/128"], 0,
  "Las LLA usan FE80::/10 y solo sirven dentro del enlace local; no se enrutan.");
q("¿En qué rango están las direcciones unicast globales (GUA) de IPv6?", ["2000::/3", "FE80::/10", "FC00::/7", "FF00::/8"], 0,
  "Las GUA (las 'públicas') empiezan con 2 o 3 en hexadecimal: 2000::/3.");
q("¿Qué método permite a un equipo crear su propia GUA usando el prefijo que anuncia el router?", ["SLAAC", "DHCPv4", "APIPA", "NAT"], 0,
  "Con SLAAC el equipo toma el prefijo del anuncio del router (RA) y genera su propio ID de interfaz.");
q("¿Qué hace el proceso EUI-64?", ["Crea el ID de interfaz de 64 bits a partir de la MAC, insertando FFFE en medio", "Traduce IPv6 a IPv4", "Asigna direcciones desde un servidor", "Comprime la dirección IPv6"], 0,
  "EUI-64 parte la MAC de 48 bits, inserta FFFE (16 bits) y cambia el 7.º bit.");
q("¿Cuál es la dirección loopback en IPv6?", ["::1", "FE80::1", "127.0.0.1", "::"], 0,
  "::1 equivale al 127.0.0.1 de IPv4.");
q("¿Qué dos técnicas permiten que IPv4 e IPv6 convivan? (Elige dos.)", ["Doble pila (dual stack)", "Tunelización", "ARP", "APIPA"], [0, 1],
  "Las técnicas de migración son doble pila, tunelización y traducción (NAT64).");

/* ───────────── Módulo 13 · ICMP ───────────── */
M(13);
q("¿Qué mensajes ICMP usa el comando ping?", ["Solicitud de eco y respuesta de eco", "Tiempo excedido y destino inalcanzable", "Solicitud y respuesta ARP", "SYN y ACK"], 0,
  "ping envía Echo Request y espera Echo Reply.");
q("¿Cómo descubre traceroute los routers del camino?", ["Envía paquetes con TTL que aumenta (1, 2, 3…) y recibe mensajes de 'tiempo excedido'", "Pregunta a cada router su nombre por DNS", "Lee la tabla de routing del destino", "Usa solicitudes ARP a cada router"], 0,
  "Cada router que baja el TTL a 0 responde con 'tiempo excedido', revelando su dirección.");
q("Si un router no tiene ruta hacia el destino, ¿qué mensaje ICMP devuelve?", ["Destino inalcanzable", "Respuesta de eco", "Redirección", "Anuncio de router"], 0,
  "Destination Unreachable avisa que el paquete no pudo entregarse.");
q("¿Qué comprueba un ping a 127.0.0.1?", ["Que TCP/IP funcione en el propio equipo", "Que haya Internet", "Que el gateway responda", "Que el cable esté conectado"], 0,
  "El loopback no sale del equipo: solo prueba la pila TCP/IP local.");
q("Para revisar la conectividad hacia fuera de tu LAN, ¿a qué conviene hacer ping primero?", ["Al gateway predeterminado", "A un servidor de Internet", "A la dirección de broadcast", "Al servidor DNS público"], 0,
  "Si el gateway no responde, el problema está en tu LAN y no tiene caso probar más lejos.");
q("¿Qué mensaje ICMPv6 envía un router para anunciar el prefijo de la red?", ["Anuncio de router (RA)", "Solicitud de vecino (NS)", "Respuesta de eco", "Destino inalcanzable"], 0,
  "El RA informa el prefijo, el gateway y cómo obtener dirección (SLAAC/DHCPv6).");
q("¿Cuál es el comando de Windows equivalente a traceroute?", ["tracert", "traceroute", "pathping -t", "ping -r"], 0,
  "En Windows es tracert; en Linux, macOS y Cisco IOS es traceroute.");
q("¿Qué dos mensajes ICMP intervienen en un ping exitoso? (Elige dos.)", ["Echo Request", "Echo Reply", "Time Exceeded", "Redirect"], [0, 1],
  "La PC envía Echo Request y el destino contesta con Echo Reply.");

/* ───────────── Módulo 14 · Capa de transporte ───────────── */
M(14);
q("¿Qué protocolo de transporte es orientado a conexión y confiable?", ["TCP", "UDP", "IP", "ICMP"], 0,
  "TCP establece la conexión, numera los datos, confirma lo recibido y reenvía lo perdido.");
q("¿Qué tipo de aplicación suele usar UDP?", ["Videollamadas y voz en tiempo real", "Descarga de archivos", "Páginas web", "Correo electrónico"], 0,
  "En tiempo real importa más la rapidez que reenviar datos perdidos.");
q("¿Qué rango tienen los puertos 'bien conocidos'?", ["0 a 1023", "1024 a 49151", "49152 a 65535", "0 a 65535"], 0,
  "0–1023 son bien conocidos (HTTP 80, HTTPS 443…); 1024–49151 registrados; 49152–65535 dinámicos.");
q("¿Cuál es el orden del saludo de tres vías de TCP?", ["SYN → SYN-ACK → ACK", "ACK → SYN → FIN", "SYN → ACK → FIN", "FIN → ACK → SYN"], 0,
  "El cliente envía SYN, el servidor SYN-ACK y el cliente confirma con ACK.");
q("¿Qué combinación forma un socket que identifica una conversación?", ["Dirección IP + número de puerto", "MAC + IP", "Puerto + protocolo de enlace", "Nombre de dominio + MAC"], 0,
  "El socket de origen y el de destino (IP:puerto) identifican cada conversación.");
q("¿Qué mecanismo de TCP evita que el emisor sature al receptor?", ["Control de flujo con el tamaño de ventana", "La suma de comprobación", "El TTL", "La dirección MAC"], 0,
  "El receptor anuncia cuántos bytes puede recibir (ventana) y el emisor no envía más que eso.");
q("¿Qué puerto usa HTTPS?", ["443", "80", "22", "53"], 0,
  "HTTPS usa 443; HTTP usa 80; SSH 22; DNS 53.");
q("¿Qué bandera TCP se usa para terminar una sesión ordenadamente?", ["FIN", "SYN", "URG", "PSH"], 0,
  "FIN indica que ya no hay más datos que enviar. El cierre normal usa 4 segmentos.");
q("¿Qué dos características son de UDP? (Elige dos.)", ["No establece conexión", "Tiene un encabezado pequeño (poca sobrecarga)", "Reenvía los segmentos perdidos", "Reordena los datos recibidos"], [0, 1],
  "UDP es simple y rápido: sin conexión, sin confirmaciones y con un encabezado de solo 8 bytes.");

/* ───────────── Módulo 15 · Capa de aplicación ───────────── */
M(15);
q("¿Qué hace DNS?", ["Traduce nombres de dominio a direcciones IP", "Asigna direcciones IP", "Envía correos", "Comparte archivos"], 0,
  "DNS convierte 'www.ejemplo.com' en la IP del servidor.");
q("¿Cuál es el orden de los mensajes DHCP para obtener una IP?", ["Discover → Offer → Request → Acknowledgment", "Request → Offer → Discover → Ack", "Offer → Discover → Ack → Request", "Discover → Request → Offer → Ack"], 0,
  "Se recuerda como DORA: Descubrir, Ofrecer, Solicitar, Confirmar.");
q("¿Qué protocolo se usa para ENVIAR correo entre servidores?", ["SMTP", "POP3", "IMAP", "HTTP"], 0,
  "SMTP envía; POP3 e IMAP sirven para que el cliente lea el correo.");
q("¿Qué protocolo deja el correo en el servidor y lo sincroniza en todos tus dispositivos?", ["IMAP", "POP3", "SMTP", "FTP"], 0,
  "IMAP mantiene los mensajes en el servidor; POP3 normalmente los descarga y los borra del servidor.");
q("¿En qué modelo cada equipo puede ser cliente y servidor al mismo tiempo?", ["Punto a punto (P2P)", "Cliente-servidor", "Mainframe", "Jerárquico"], 0,
  "En P2P los equipos comparten recursos entre sí sin un servidor dedicado.");
q("¿Qué protocolo usa Windows para compartir archivos e impresoras?", ["SMB", "FTP", "SMTP", "DNS"], 0,
  "SMB (Server Message Block) permite compartir carpetas e impresoras en redes Windows.");
q("¿Qué puertos usa FTP?", ["20 (datos) y 21 (control)", "22 y 23", "80 y 443", "67 y 68"], 0,
  "FTP usa el 21 para los comandos y el 20 para transferir los datos.");
q("¿Qué dos funciones pertenecen a la capa de presentación? (Elige dos.)", ["Cifrado de los datos", "Compresión y formato de los datos", "Direccionamiento IP", "Control de flujo"], [0, 1],
  "Presentación da formato, comprime y cifra. El direccionamiento es de red y el control de flujo de transporte.");

/* ───────────── Módulo 16 · Fundamentos de seguridad de la red ───────────── */
M(16);
q("¿Qué tipo de ataque engaña a las personas para que revelen información?", ["Ingeniería social", "Denegación de servicio", "Desbordamiento de búfer", "Escaneo de puertos"], 0,
  "La ingeniería social (como el phishing) ataca a las personas, no a las máquinas.");
q("¿Qué tipo de malware se copia solo por la red sin necesitar un programa anfitrión?", ["Gusano", "Virus", "Troyano", "Adware"], 0,
  "El gusano se propaga solo; el virus necesita que alguien ejecute un programa infectado.");
q("¿Qué malware se hace pasar por un programa útil para engañar al usuario?", ["Troyano", "Gusano", "Ransomware", "Rootkit"], 0,
  "Como el caballo de Troya: parece un regalo, pero trae algo dañino dentro.");
q("¿Qué ataque busca que un servicio deje de estar disponible para los usuarios?", ["Denegación de servicio (DoS)", "Phishing", "Reconocimiento", "Suplantación ARP"], 0,
  "DoS satura el servicio para que los usuarios legítimos no puedan usarlo.");
q("Un atacante hace barridos de ping y escaneos de puertos para conocer la red. ¿Qué tipo de ataque es?", ["De reconocimiento", "De acceso", "De denegación de servicio", "De ingeniería social"], 0,
  "El reconocimiento es la fase de 'investigar' la red antes de atacarla.");
q("¿Qué comando genera las claves necesarias para usar SSH en un equipo Cisco?", ["crypto key generate rsa", "ip ssh enable", "service password-encryption", "transport input telnet"], 0,
  "SSH necesita claves RSA; también hacen falta un hostname y un nombre de dominio (ip domain-name).");
q("¿Qué protocolo seguro debe usarse en lugar de Telnet?", ["SSH", "HTTP", "FTP", "SNMPv1"], 0,
  "Telnet envía todo en texto plano; SSH cifra la sesión.");
q("¿Qué comando bloquea los inicios de sesión por un tiempo después de varios intentos fallidos?", ["login block-for", "exec-timeout", "banner motd", "security passwords"], 0,
  "login block-for 120 attempts 3 within 60 frena los ataques de fuerza bruta.");
q("¿Qué dos medidas fortalecen el acceso administrativo a un router? (Elige dos.)", ["Usar enable secret", "Permitir solo SSH", "Habilitar Telnet", "Dejar la contraseña de fábrica"], [0, 1],
  "enable secret cifra la contraseña del modo privilegiado y SSH protege el acceso remoto.");

/* ───────────── Módulo 17 · Cree una red pequeña ───────────── */
M(17);
q("¿Qué comando de IOS muestra la tabla de routing?", ["show ip route", "show ip interface brief", "show arp", "show running-config"], 0,
  "show ip route lista las redes que conoce el router y por dónde llegar a cada una.");
q("¿Qué comando de Windows muestra la configuración IP completa, incluyendo MAC y DNS?", ["ipconfig /all", "ipconfig", "netstat", "nslookup"], 0,
  "ipconfig solo muestra lo básico; /all agrega MAC, DNS, DHCP y más.");
q("¿Qué método de solución de problemas empieza revisando la capa física?", ["Ascendente (de abajo hacia arriba)", "Descendente", "Divide y vencerás", "Adivinanza fundamentada"], 0,
  "El ascendente revisa primero cables y luces, y luego sube por las capas.");
q("Un extremo del enlace está en full-duplex y el otro en half-duplex. ¿Cómo se llama el problema?", ["Discordancia de dúplex", "Bucle de capa 2", "Conflicto de IP", "Ruta faltante"], 0,
  "La discordancia de dúplex provoca colisiones y lentitud.");
q("¿Qué tipo de tráfico es más sensible al retraso y necesita QoS en una red pequeña?", ["Voz y video", "Correo electrónico", "Descarga de archivos", "Actualizaciones del sistema"], 0,
  "La voz y el video en tiempo real se cortan si los paquetes llegan tarde.");
q("¿Qué comando muestra los equipos Cisco conectados directamente?", ["show cdp neighbors", "show ip route", "show version", "show interfaces"], 0,
  "CDP descubre a los vecinos Cisco: nombre, modelo y puerto de conexión.");
q("¿Qué comando de Windows borra la memoria caché de DNS?", ["ipconfig /flushdns", "ipconfig /release", "nslookup /clear", "arp -d"], 0,
  "flushdns obliga al equipo a volver a preguntar los nombres al servidor DNS.");
q("Al planear una red pequeña, ¿qué dos aspectos son importantes? (Elige dos.)", ["El costo", "Que pueda crecer (escalabilidad)", "Usar Telnet en lugar de SSH", "Eliminar toda redundancia"], [0, 1],
  "En una red pequeña se cuida el presupuesto y que pueda crecer con la organización.");

export const QUESTIONS: readonly Question[] = bank;
export const questionById = (id: string) => bank.find((x) => x.id === id);
export const questionsForModules = (mods: number[]) => bank.filter((x) => mods.includes(x.module));
