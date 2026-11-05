import { L } from "./types";

export const LESSONS_11_17 = [
  /* ───────── Módulo 11 · Asignación de direcciones IPv4 ───────── */
  L("11.1", [
    "Una dirección IPv4 tiene 32 bits y se divide en dos partes: la **porción de red** (identifica a la red; es igual para todos los equipos de esa red) y la **porción de host** (identifica a cada equipo). La **máscara de subred** indica dónde termina una y empieza la otra: los bits en 1 marcan la red.",
    "La máscara se escribe en decimal (`255.255.255.0`) o como **prefijo** (`/24` = 24 bits en 1). Al aplicar un **AND lógico** entre la IP y la máscara se obtiene la **dirección de red**. En cada red hay tres direcciones clave: la de **red** (todos los bits de host en 0), la de **broadcast** (todos en 1) y las de **hosts** (todas las de en medio).",
  ], [
    "IP = porción de red + porción de host.",
    "La máscara (o el prefijo /n) marca los bits de red.",
    "Red = bits de host en 0; broadcast = bits de host en 1.",
  ], "En `192.168.1.25/24`, la red es 192.168.1.0, el broadcast es 192.168.1.255 y los hosts van de .1 a .254."),
  L("11.2", [
    "IPv4 tiene tres formas de enviar. **Unicast**: de un equipo a otro (la mayoría del tráfico). **Broadcast**: a todos los equipos de la red; puede ser **limitado** (`255.255.255.255`, no lo reenvían los routers) o **dirigido** (el broadcast de una red específica).",
    "**Multicast**: a un grupo de equipos suscritos, usando el rango **224.0.0.0 a 239.255.255.255**. Por ejemplo, los routers OSPF se comunican con `224.0.0.5`. Es más eficiente que enviar copias unicast a cada miembro.",
  ], [
    "Unicast = uno a uno.",
    "Broadcast = a todos los de la red (los routers no lo reenvían).",
    "Multicast = a un grupo (224.0.0.0 – 239.255.255.255).",
  ]),
  L("11.3", [
    "Las **direcciones privadas** (RFC 1918) se usan dentro de casas y empresas y no se enrutan en Internet: **10.0.0.0/8**, **172.16.0.0/12** (de 172.16 a 172.31) y **192.168.0.0/16**. Para salir a Internet, el router las traduce a una IP pública con **NAT**. Las **públicas** son únicas en el mundo y las asignan los registros regionales (en Latinoamérica, LACNIC).",
    "Hay rangos especiales: **loopback** `127.0.0.0/8` (el propio equipo), **enlace local o APIPA** `169.254.0.0/16` (se la pone sola una PC que no obtuvo IP por DHCP). Antiguamente existían las **clases A, B y C**; hoy se usa el direccionamiento **sin clase (CIDR)**, donde el prefijo puede ser cualquier valor.",
  ], [
    "Privadas: 10/8, 172.16/12, 192.168/16 (requieren NAT para salir).",
    "Loopback 127.0.0.1; APIPA 169.254.x.x = falló DHCP.",
    "Hoy se usa CIDR en lugar de las clases A, B y C.",
  ]),
  L("11.4", [
    "Una red muy grande tiene problemas: mucho tráfico de **broadcast**, más lentitud y más riesgo, porque cualquier equipo ve a todos. La solución es **segmentar**: dividirla en redes más pequeñas llamadas **subredes**.",
    "Se puede segmentar por **ubicación** (piso, edificio), por **grupo o función** (estudiantes, profesores, administración) o por **tipo de dispositivo** (impresoras, servidores, cámaras). Cada subred es un **dominio de broadcast** separado y el router controla el tráfico entre ellas.",
  ], [
    "Segmentar reduce broadcasts y mejora la seguridad.",
    "Criterios: ubicación, grupo/función o tipo de dispositivo.",
    "Cada subred es un dominio de broadcast distinto.",
  ]),
  L("11.5", [
    "Hacer **subnetting** es **pedir bits prestados** a la porción de host para crear subredes. Si de una /24 tomas 2 bits, obtienes una /26: **2² = 4 subredes**, cada una con **2⁶ = 64 direcciones** (62 hosts utilizables, porque se restan la de red y la de broadcast).",
    "El atajo del **tamaño de bloque**: 256 menos el último octeto no completo de la máscara. Con /26 la máscara es 255.255.255.**192**, así que el bloque es 256 − 192 = **64**: las subredes empiezan en .0, .64, .128 y .192. Para saber a cuál pertenece un host, busca el bloque donde cae: 192.168.10.**77**/26 está en la subred **.64** (broadcast .127).",
  ], [
    "Subredes = 2^(bits prestados); hosts = 2^(bits de host) − 2.",
    "Tamaño de bloque = 256 − valor de la máscara en el octeto interesante.",
    "La red de un host es el inicio del bloque donde cae.",
  ], "Fórmula rápida para /27: máscara .224 → bloque 32 → redes en 0, 32, 64, 96… y 30 hosts cada una."),
  L("11.6", [
    "El mismo método funciona con redes más grandes. Con una **/16** (por ejemplo 172.16.0.0/16) puedes pedir bits del tercer octeto: una **/24** crea 2⁸ = 256 subredes de 254 hosts. Con una **/8** (10.0.0.0/8) tienes aún más bits disponibles: una **/16** da 256 subredes de 65 534 hosts.",
    "Cuando el prefijo cae dentro del tercer octeto, el tamaño de bloque se aplica a ese octeto. En una /20 la máscara es 255.255.**240**.0: el bloque es 16, así que las redes son 172.16.0.0, 172.16.16.0, 172.16.32.0…",
  ], [
    "En /16 y /8 se pueden pedir prestados bits del 3.º (y 2.º) octeto.",
    "El tamaño de bloque se aplica al octeto donde termina el prefijo.",
    "/20 → bloques de 16 en el tercer octeto.",
  ]),
  L("11.7", [
    "Para diseñar subredes hay que cumplir dos requisitos: el **número de subredes** que se necesitan y el **número de hosts** de la subred más grande. Se eligen los bits para que alcancen ambos sin desperdiciar demasiadas direcciones.",
    "También se planea el crecimiento: conviene dejar subredes libres para el futuro. En redes privadas sobran direcciones, así que se puede ser generoso; con direcciones **públicas**, que son escasas y cuestan, hay que ajustar con precisión.",
  ], [
    "Requisitos: cantidad de subredes y hosts de la subred más grande.",
    "Planear el crecimiento futuro.",
    "Las IP públicas son escasas: se asignan con precisión.",
  ]),
  L("11.8", [
    "Con subnetting tradicional todas las subredes tienen el mismo tamaño, y eso desperdicia direcciones: un enlace entre dos routers solo necesita 2 IP, pero recibiría tantas como una LAN de 60 equipos.",
    "**VLSM** (máscara de subred de longitud variable) permite **subdividir subredes** y usar una máscara distinta para cada una según su tamaño. Se asignan primero las subredes más grandes y al final las pequeñas, como los enlaces punto a punto con **/30** (2 hosts).",
  ], [
    "VLSM: máscaras distintas según el tamaño de cada subred.",
    "Asignar de la subred más grande a la más pequeña.",
    "Enlaces entre routers: /30 (2 hosts).",
  ]),
  L("11.9", [
    "Un **plan de direccionamiento** organizado hace que la red sea fácil de administrar y de reparar. Se documenta qué subred tiene cada área y se reservan rangos por tipo de dispositivo: por ejemplo, las primeras direcciones para routers y servidores, un rango para impresoras y el resto para usuarios con DHCP.",
    "Los dispositivos que otros deben encontrar siempre (servidores, impresoras, interfaces de router) usan **IP estática**; los equipos de los usuarios, **DHCP**.",
  ], [
    "Documentar las subredes y los rangos asignados.",
    "Estáticas: routers, servidores e impresoras. Dinámicas (DHCP): usuarios.",
    "Un buen plan facilita la administración y la solución de problemas.",
  ]),

  /* ───────── Módulo 12 · Asignación de direcciones IPv6 ───────── */
  L("12.1", [
    "IPv4 solo tiene unos **4 300 millones** de direcciones, y los registros regionales ya las agotaron. Con miles de millones de teléfonos, computadoras y dispositivos del **Internet de las cosas (IoT)**, no alcanzan. **NAT** ayudó a estirarlas, pero complica la comunicación de extremo a extremo.",
    "**IPv6** ofrece 2¹²⁸ direcciones, una cantidad prácticamente inagotable. Como no se puede cambiar todo de golpe, conviven usando **doble pila** (los equipos tienen IPv4 e IPv6 a la vez), **tunelización** (IPv6 viaja dentro de IPv4) y **traducción** (NAT64).",
  ], [
    "Las direcciones IPv4 públicas se agotaron.",
    "IPv6 = 128 bits, espacio prácticamente ilimitado.",
    "Migración: doble pila, tunelización y traducción (NAT64).",
  ]),
  L("12.2", [
    "Una dirección IPv6 tiene **128 bits** escritos en **8 grupos de 4 dígitos hexadecimales** (hextetos) separados por `:`. Por ejemplo: `2001:0db8:0000:0000:0000:ff00:0042:8329`.",
    "Hay dos reglas para abreviar. **Regla 1**: quitar los ceros a la izquierda de cada grupo (`0db8` → `db8`, `0000` → `0`). **Regla 2**: un bloque de grupos seguidos en cero se reemplaza por `::`, **solo una vez** en la dirección (si no, sería imposible saber cuántos ceros había). El ejemplo queda: `2001:db8::ff00:42:8329`.",
  ], [
    "128 bits = 8 hextetos de 4 dígitos hexadecimales.",
    "Regla 1: quitar ceros a la izquierda.",
    "Regla 2: `::` reemplaza un bloque de ceros, solo una vez.",
  ]),
  L("12.3", [
    "En IPv6 no existe el broadcast; hay **unicast**, **multicast** y **anycast** (una dirección compartida por varios equipos; responde el más cercano).",
    "Tipos de unicast: **GUA** (unicast global, enrutable en Internet, empieza con `2000::/3`), **LLA** (link-local, `fe80::/10`, solo funciona en el enlace local y **todo equipo con IPv6 la tiene**), **ULA** (`fc00::/7`, parecida a las privadas de IPv4) y **loopback** `::1`. El prefijo normal de una red local es **/64**: 64 bits para la red y 64 para el ID de interfaz.",
  ], [
    "Sin broadcast: unicast, multicast y anycast.",
    "GUA = 2000::/3 (global); LLA = fe80::/10 (enlace local).",
    "Loopback = ::1; prefijo típico de una LAN = /64.",
  ]),
  L("12.4", [
    "Una **GUA** tiene tres partes: el **prefijo de enrutamiento global** (lo asigna el proveedor, por ejemplo /48), el **ID de subred** (16 bits para crear hasta 65 536 subredes /64) y el **ID de interfaz** (64 bits que identifican al equipo).",
    "En un router Cisco se configura con `ipv6 address 2001:db8:acad:1::1/64` en la interfaz. La **LLA** se crea sola, pero conviene ponerla a mano para que sea fácil de reconocer: `ipv6 address fe80::1 link-local`. Así el gateway de todas las redes puede ser `fe80::1`.",
  ], [
    "GUA = prefijo global + ID de subred + ID de interfaz.",
    "`ipv6 address <dirección>/64` configura una GUA.",
    "`ipv6 address fe80::1 link-local` fija una LLA fácil de recordar.",
  ]),
  L("12.5", [
    "Un equipo puede obtener su GUA automáticamente gracias al **anuncio de router (RA)** de ICMPv6, que dice cómo hacerlo. Hay tres métodos: **SLAAC** (el equipo arma su dirección con el prefijo del RA, sin servidor), **SLAAC + DHCPv6 sin estado** (dirección por SLAAC y datos extra, como el DNS, por DHCPv6) y **DHCPv6 con estado** (un servidor asigna la dirección completa, como en IPv4).",
    "Con SLAAC el ID de interfaz se genera con **EUI-64** (a partir de la MAC: se parte en dos, se inserta `FFFE` en medio y se invierte el 7.º bit) o de forma **aleatoria**, que protege mejor la privacidad.",
  ], [
    "El RA indica el método: SLAAC, SLAAC + DHCPv6 sin estado o DHCPv6 con estado.",
    "SLAAC: el equipo arma su propia dirección sin servidor.",
    "EUI-64 usa la MAC + FFFE; el método aleatorio protege la privacidad.",
  ]),
  L("12.6", [
    "Todo equipo con IPv6 crea su **dirección link-local (LLA)** al encender la interfaz, sin necesitar a nadie: toma el prefijo `fe80::/64` y le agrega un ID de interfaz por **EUI-64** o **aleatorio**.",
    "Los routers Cisco usan EUI-64 para sus LLA, por eso suelen configurarse a mano. Las LLA se usan, por ejemplo, como dirección del gateway que anuncian los routers y para la comunicación entre vecinos. Con `show ipv6 interface brief` se ven las LLA y las GUA de un router.",
  ], [
    "La LLA se crea automáticamente con fe80::/64.",
    "Su ID de interfaz puede ser EUI-64 o aleatorio.",
    "`show ipv6 interface brief` muestra las direcciones IPv6.",
  ]),
  L("12.7", [
    "Las direcciones **multicast** de IPv6 empiezan con `ff00::/8`. Algunas son bien conocidas: `ff02::1` (**todos los nodos** del enlace; reemplaza al broadcast) y `ff02::2` (**todos los routers** del enlace; un router Cisco se une a ella al activar `ipv6 unicast-routing`).",
    "La **multicast de nodo solicitado** (`ff02::1:ffXX:XXXX`, formada con los últimos 24 bits de la dirección unicast) permite que la resolución de direcciones solo moleste a los equipos cuya dirección termina igual.",
  ], [
    "Multicast IPv6 = ff00::/8.",
    "ff02::1 = todos los nodos; ff02::2 = todos los routers.",
    "La de nodo solicitado hace eficiente la resolución de direcciones.",
  ]),
  L("12.8", [
    "Hacer subredes en IPv6 es más sencillo que en IPv4: no hay que pedir bits prestados de los hosts. Se usa el **ID de subred** de 16 bits y cada subred es una **/64**.",
    "Con un prefijo global `2001:db8:acad::/48` las subredes son `2001:db8:acad:0000::/64`, `2001:db8:acad:0001::/64`, `…:0002::/64` y así hasta 65 536. Basta con ir contando en el cuarto hexteto.",
  ], [
    "Las subredes IPv6 usan el ID de subred de 16 bits.",
    "Cada subred LAN es /64.",
    "Se cuenta en el hexteto del ID de subred: …:1::, …:2::, …:3::",
  ]),

  /* ───────── Módulo 13 · ICMP ───────── */
  L("13.1", [
    "IP no avisa si algo sale mal; para eso existe **ICMP** (en IPv6, **ICMPv6**): un protocolo de **mensajes de control y error**. Algunos mensajes son: **solicitud y respuesta de eco** (los usa ping), **destino inalcanzable** (no hay ruta, la red o el puerto no existen), **tiempo excedido** (el TTL llegó a 0) y **redirección**.",
    "ICMPv6 agrega los mensajes de **Neighbor Discovery**: solicitud y anuncio de router (RS/RA) y de vecino (NS/NA). Muchos firewalls bloquean ICMP por seguridad, por eso a veces un ping falla aunque el equipo sí esté encendido.",
  ], [
    "ICMP informa errores y permite diagnósticos.",
    "Mensajes: eco, destino inalcanzable, tiempo excedido, redirección.",
    "ICMPv6 incluye RS, RA, NS y NA.",
  ]),
  L("13.2", [
    "**Ping** envía solicitudes de eco y mide el tiempo de ida y vuelta. Se usa en orden: `ping 127.0.0.1` (¿funciona TCP/IP en mi equipo?), ping al **gateway** (¿llego a mi router?) y ping a un **equipo remoto** (¿llego a otras redes?). En Cisco, `!` significa respuesta recibida y `.` tiempo de espera agotado.",
    "**Traceroute** (`tracert` en Windows) muestra los routers del camino. Envía paquetes con **TTL = 1, 2, 3…**; cada router que baja el TTL a 0 responde con \"tiempo excedido\" y así revela su dirección y el tiempo de cada salto. Sirve para ubicar en qué punto se pierde la comunicación.",
  ], [
    "Orden de ping: loopback → gateway → equipo remoto.",
    "Traceroute aprovecha el TTL y los mensajes de tiempo excedido.",
    "`tracert` en Windows; `traceroute` en Linux, macOS y Cisco.",
  ]),

  /* ───────── Módulo 14 · Capa de transporte ───────── */
  L("14.1", [
    "La **capa de transporte** comunica a las **aplicaciones** de dos equipos. Divide los datos en **segmentos**, identifica cada aplicación con un **número de puerto** y puede controlar que todo llegue completo.",
    "Tiene dos protocolos: **TCP**, confiable y orientado a conexión (para la web, el correo o descargar archivos), y **UDP**, rápido y sin garantías (para voz y video en tiempo real, juegos en línea o DNS).",
  ], [
    "Comunica aplicaciones de extremo a extremo.",
    "Usa números de puerto para identificar cada aplicación.",
    "TCP = confiable; UDP = rápido y sencillo.",
  ]),
  L("14.2", [
    "**TCP** ofrece: **establecimiento de sesión** (saludo de tres vías), **entrega confiable** (confirma lo recibido y reenvía lo perdido), **entrega en orden** (usa números de secuencia para reordenar) y **control de flujo** (no satura al receptor).",
    "Por eso su encabezado es más grande (al menos **20 bytes**): puertos de origen y destino, número de secuencia, número de acuse de recibo (ACK), longitud del encabezado, **banderas** (SYN, ACK, FIN, RST, PSH, URG), tamaño de ventana, suma de verificación y puntero urgente.",
  ], [
    "TCP: sesión, confiabilidad, orden y control de flujo.",
    "Encabezado de 20 bytes o más.",
    "Banderas importantes: SYN, ACK, FIN, RST.",
  ]),
  L("14.3", [
    "**UDP** es un protocolo de transporte **sin conexión**: no saluda, no confirma, no reordena y no reenvía. A cambio tiene un encabezado de solo **8 bytes** (puertos de origen y destino, longitud y suma de verificación) y muy poca demora.",
    "Es ideal cuando la **velocidad importa más que la perfección**: en una videollamada, reenviar un trozo de audio que llegó tarde no sirve. También lo usan DNS, DHCP, TFTP y SNMP. Si la aplicación necesita confiabilidad sobre UDP, ella misma debe encargarse.",
  ], [
    "UDP: sin conexión, sin confirmaciones, encabezado de 8 bytes.",
    "Usos: voz y video en vivo, juegos, DNS, DHCP, TFTP.",
    "La aplicación decide si necesita controlar errores.",
  ]),
  L("14.4", [
    "Los **números de puerto** permiten que un equipo atienda muchas aplicaciones a la vez. Van de 0 a 65 535: **bien conocidos** (0–1023: HTTP 80, HTTPS 443, SSH 22, Telnet 23, SMTP 25, DNS 53, DHCP 67/68, POP3 110, IMAP 143), **registrados** (1024–49 151) y **dinámicos o privados** (49 152–65 535), que el cliente elige al azar como puerto de origen.",
    "La combinación de **IP + puerto** se llama **socket** (por ejemplo `192.168.1.5:50123`). Un par de sockets (origen y destino) identifica cada conversación. Con `netstat` puedes ver las conexiones abiertas de tu PC.",
  ], [
    "Bien conocidos 0–1023; registrados 1024–49151; dinámicos 49152–65535.",
    "Socket = IP + puerto.",
    "`netstat` muestra las conexiones TCP activas.",
  ]),
  L("14.5", [
    "Un servidor **escucha** en su puerto bien conocido. Para conectarse, cliente y servidor hacen el **saludo de tres vías**: el cliente envía **SYN** (quiero conectarme), el servidor responde **SYN-ACK** (acepto y también me sincronizo) y el cliente confirma con **ACK**.",
    "Para terminar se usan **4 segmentos**: un lado envía **FIN**, el otro responde **ACK**; cuando ese otro termina también envía **FIN** y recibe **ACK**. La bandera **RST** corta la conexión de golpe cuando algo sale mal.",
  ], [
    "Apertura: SYN → SYN-ACK → ACK.",
    "Cierre: FIN → ACK → FIN → ACK.",
    "RST reinicia o rechaza una conexión.",
  ], "Es como una llamada: \"¿Me escuchas?\" (SYN) – \"Sí, ¿y tú a mí?\" (SYN-ACK) – \"Sí\" (ACK). Para colgar, cada uno se despide."),
  L("14.6", [
    "TCP numera cada **byte** con un **número de secuencia**. El receptor responde con un **acuse de recibo (ACK)** que indica el **siguiente byte que espera**: si recibió los bytes 1 a 1000, envía ACK 1001. Lo que no se confirma a tiempo se **retransmite**; también existen los ACK selectivos (SACK).",
    "El **control de flujo** usa el **tamaño de ventana**: el receptor dice cuántos bytes puede recibir antes de confirmar, y el emisor no envía más que eso. Además, TCP reduce su ritmo si detecta pérdidas, para **evitar la congestión** de la red.",
  ], [
    "ACK = siguiente byte que se espera recibir.",
    "Lo no confirmado se retransmite.",
    "La ventana controla el flujo; TCP baja el ritmo ante congestión.",
  ]),
  L("14.7", [
    "Como UDP no tiene sesión, el servidor simplemente **espera datagramas** en su puerto y responde a quien le escriba. El cliente elige un puerto de origen dinámico y lo usa para recibir la respuesta.",
    "Los datagramas pueden llegar **en desorden o perderse**; UDP no los reordena. Si la aplicación lo necesita, ella misma los organiza o vuelve a pedir lo que falte.",
  ], [
    "UDP no establece sesión: solo envía datagramas.",
    "El cliente usa un puerto de origen dinámico.",
    "No hay reordenamiento ni retransmisión en UDP.",
  ]),

  /* ───────── Módulo 15 · Capa de aplicación ───────── */
  L("15.1", [
    "En TCP/IP, la **capa de aplicación** reúne las tres capas superiores de OSI. La **aplicación** (7) ofrece los servicios de red a los programas. La **presentación** (6) da **formato**, **comprime** (JPEG, MP3) y **cifra** los datos. La **sesión** (5) inicia, mantiene y termina los diálogos entre aplicaciones.",
    "Protocolos de esta capa son DNS, DHCP, HTTP, SMTP, POP3, IMAP, FTP, TFTP y SMB, entre otros.",
  ], [
    "Aplicación (7): servicios de red para los programas.",
    "Presentación (6): formato, compresión y cifrado.",
    "Sesión (5): inicio, mantenimiento y cierre de diálogos.",
  ]),
  L("15.2", [
    "En el modelo **cliente-servidor**, un equipo pide un servicio (cliente) y otro lo ofrece (servidor), como al abrir una página web. Es fácil de administrar y proteger.",
    "En las redes **punto a punto (P2P)** cada equipo puede ser cliente y servidor a la vez y comparte recursos con los demás sin un servidor central, como en BitTorrent o al compartir una carpeta entre dos PCs. Es barato pero difícil de controlar y asegurar a gran escala.",
  ], [
    "Cliente-servidor: roles separados, administración centralizada.",
    "P2P: cada equipo es cliente y servidor.",
    "P2P es económico pero difícil de administrar y asegurar.",
  ]),
  L("15.3", [
    "Al escribir una **URL**, el navegador usa **HTTP** para pedir la página al servidor web con mensajes como **GET** (pedir) y **POST** (enviar datos de un formulario). **HTTPS** hace lo mismo, pero cifrado con **TLS** (puerto 443); HTTP usa el 80.",
    "El correo usa tres protocolos: **SMTP** (puerto 25) para **enviar** mensajes entre clientes y servidores; **POP3** (110) para **descargarlos**, normalmente borrándolos del servidor; e **IMAP** (143) para **leerlos dejándolos en el servidor**, sincronizados en todos tus dispositivos.",
  ], [
    "HTTP (80) y HTTPS (443, cifrado con TLS).",
    "SMTP envía correo.",
    "POP3 descarga; IMAP sincroniza dejando el correo en el servidor.",
  ]),
  L("15.4", [
    "**DNS** traduce nombres fáciles de recordar (`www.ejemplo.com`) a direcciones IP. Es una base de datos distribuida y jerárquica: servidores **raíz**, de **dominio de nivel superior** (.com, .mx, .org) y los de cada dominio. Sus registros más comunes son **A** (IPv4), **AAAA** (IPv6), **MX** (servidor de correo) y **NS**. Con `nslookup` puedes hacer consultas.",
    "**DHCP** asigna automáticamente IP, máscara, gateway y DNS. El proceso tiene 4 mensajes, conocido como **DORA**: **Discover** (el cliente busca servidores), **Offer** (el servidor ofrece una IP), **Request** (el cliente la pide) y **Acknowledgment** (el servidor confirma). La dirección se presta por un tiempo llamado **arrendamiento**.",
  ], [
    "DNS: nombre → IP. Registros A, AAAA, MX, NS.",
    "DHCP: IP, máscara, gateway y DNS automáticos.",
    "DORA: Discover, Offer, Request, Acknowledgment.",
  ]),
  L("15.5", [
    "**FTP** transfiere archivos entre un cliente y un servidor usando **dos conexiones**: el puerto **21** para los comandos (control) y el **20** para los datos. No cifra la información; existen versiones seguras como SFTP y FTPS.",
    "**SMB** (Server Message Block) permite compartir **archivos, carpetas e impresoras** en redes Windows (también lo usan macOS y Linux con Samba). A diferencia de FTP, mantiene una conexión a largo plazo para acceder a los recursos como si fueran locales.",
  ], [
    "FTP: puerto 21 (control) y 20 (datos), sin cifrar.",
    "SMB: compartir archivos e impresoras en la red.",
    "Para transferencias seguras: SFTP o FTPS.",
  ]),

  /* ───────── Módulo 16 · Fundamentos de seguridad de la red ───────── */
  L("16.1", [
    "Una **vulnerabilidad** es una debilidad; una **amenaza** es algo que puede aprovecharla; un **ataque** es el aprovechamiento real; y el **riesgo** es la probabilidad de que ocurra y su impacto. Las vulnerabilidades pueden ser **tecnológicas** (fallas en protocolos o sistemas), de **configuración** (contraseñas por defecto, servicios innecesarios) o de **políticas** (no hay reglas claras).",
    "También hay **amenazas físicas**: al hardware (robo, daño), ambientales (calor, humedad), eléctricas (picos de voltaje) y de mantenimiento (mal manejo de componentes). Proteger un cuarto de equipos con llave y control de temperatura también es seguridad.",
  ], [
    "Vulnerabilidad = debilidad; amenaza = quien puede aprovecharla.",
    "Vulnerabilidades: tecnológicas, de configuración y de políticas.",
    "Amenazas físicas: hardware, ambientales, eléctricas y de mantenimiento.",
  ]),
  L("16.2", [
    "El **malware** es software malicioso: un **virus** se adjunta a un programa y se activa al ejecutarlo; un **gusano** se propaga solo por la red; un **troyano** se disfraza de algo útil. Los **ataques de reconocimiento** investigan la red (barridos de ping, escaneo de puertos, consultas de información pública).",
    "Los **ataques de acceso** buscan entrar o robar: descifrado de **contraseñas**, abuso de **confianza**, **redirección de puertos** y **intermediario** (*man-in-the-middle*). Los ataques de **denegación de servicio (DoS)** saturan un servicio para que nadie pueda usarlo; los **DDoS** lo hacen desde miles de equipos infectados (botnets). La **ingeniería social** —como el **phishing**— engaña a las personas.",
  ], [
    "Malware: virus, gusanos y troyanos.",
    "Reconocimiento → acceso → DoS/DDoS.",
    "La ingeniería social (phishing) ataca a las personas.",
  ]),
  L("16.3", [
    "La defensa se organiza **en profundidad**: varias capas de protección. Incluye **copias de seguridad** (probadas y guardadas en otro lugar), **actualizaciones y parches** al día, **antivirus** en los equipos, **firewalls** que filtran el tráfico y **VPN** para el acceso remoto.",
    "El esquema **AAA** controla quién entra (**autenticación**), qué puede hacer (**autorización**) y qué hizo (**registro o accounting**). La mejor tecnología falla si los usuarios no están **capacitados** para reconocer engaños.",
  ], [
    "Defensa en profundidad: muchas capas de protección.",
    "Respaldos, parches, antivirus, firewall y VPN.",
    "AAA = autenticación, autorización y registro.",
  ]),
  L("16.4", [
    "Para asegurar routers y switches: cambiar las **contraseñas por defecto** y usar contraseñas **largas** (frases de 10 o más caracteres), `enable secret`, `service password-encryption` y `security passwords min-length`. Contra la fuerza bruta: `login block-for 120 attempts 3 within 60` y `exec-timeout` para cerrar sesiones inactivas.",
    "Para el acceso remoto se usa **SSH** en lugar de Telnet: se necesita `hostname`, `ip domain-name`, generar claves con `crypto key generate rsa`, crear un usuario local (`username … secret …`) y en las líneas VTY `login local` y `transport input ssh`. Además, se apagan los servicios y puertos que no se usan.",
  ], [
    "Contraseñas fuertes, `enable secret` y longitud mínima.",
    "`login block-for` frena la fuerza bruta.",
    "SSH: hostname + ip domain-name + crypto key generate rsa + transport input ssh.",
  ]),

  /* ───────── Módulo 17 · Cree una red pequeña ───────── */
  L("17.1", [
    "Una red pequeña (una tienda, una escuela) suele tener un **router** con acceso a Internet, uno o varios **switches**, un punto de acceso **inalámbrico** y los dispositivos de los usuarios. Al elegir equipos se consideran el **costo**, la **cantidad y velocidad de puertos**, la **posibilidad de crecer** y las funciones del sistema operativo.",
    "También se planea el **direccionamiento IP** (qué rango tiene cada tipo de equipo) y la **redundancia** (equipos o enlaces de respaldo) según qué tan importante sea que la red nunca se detenga.",
  ], [
    "Componentes: router, switches, acceso inalámbrico y hosts.",
    "Criterios: costo, puertos, velocidad y capacidad de crecer.",
    "Planear direccionamiento y redundancia.",
  ]),
  L("17.2", [
    "Aun en redes pequeñas se usan aplicaciones y protocolos comunes: web (HTTP/HTTPS), correo, DNS, DHCP, transferencia de archivos y administración remota con SSH.",
    "Si hay **voz sobre IP** o **video**, la red debe ofrecer **calidad de servicio (QoS)**, porque estos tráficos son sensibles al **retardo** y a la **variación del retardo (jitter)**. Se prioriza la voz sobre, por ejemplo, la descarga de un archivo.",
  ], [
    "Protocolos comunes: HTTP/HTTPS, DNS, DHCP, correo, SSH.",
    "Voz y video necesitan QoS.",
    "Retardo y jitter afectan la calidad de las llamadas.",
  ]),
  L("17.3", [
    "Para que una red pequeña crezca bien hay que **documentarla** (diagramas, inventario de equipos), **inventariar las aplicaciones** y **analizar el tráfico** para saber qué protocolos se usan y cuánto ancho de banda consumen.",
    "Con esos datos se decide cuándo agregar switches, mejorar los enlaces o separar la red en más subredes, en vez de improvisar cuando ya hay problemas.",
  ], [
    "Documentar la red y sus aplicaciones.",
    "Analizar el tráfico para planear el crecimiento.",
    "Crecer con un plan, no improvisando.",
  ]),
  L("17.4", [
    "Una red nueva o modificada debe verificarse y se debe guardar una **línea base** (cómo se comporta cuando funciona bien) para compararla después. Las herramientas principales son **ping** y **traceroute**.",
    "En Cisco existe el **ping extendido** (más opciones, como elegir la interfaz de origen) y el **traceroute extendido**. Guardar los resultados de una línea base ayuda a detectar si algo empeoró, por ejemplo tiempos de respuesta más altos.",
  ], [
    "Verificar con ping y traceroute.",
    "La línea base registra el funcionamiento normal.",
    "Ping y traceroute extendidos dan más opciones en Cisco.",
  ]),
  L("17.5", [
    "Comandos de las PC: `ipconfig` (`/all`, `/release`, `/renew`, `/displaydns`, `/flushdns`) en Windows, `ifconfig` o `ip address` en Linux y macOS, y `arp -a` para ver la caché ARP.",
    "Comandos de IOS: `show running-config`, `show interfaces`, `show ip interface brief`, `show ip route`, `show arp`, `show version` (modelo, versión de IOS y memoria), `show protocols` y `show cdp neighbors` (vecinos Cisco conectados directamente).",
  ], [
    "PC: ipconfig /all, /release, /renew, /flushdns y arp -a.",
    "IOS: show ip interface brief, show ip route, show version.",
    "`show cdp neighbors` descubre los equipos Cisco vecinos.",
  ]),
  L("17.6", [
    "Solucionar problemas con método ahorra tiempo. El proceso general es: **identificar** el problema, **establecer una teoría** de la causa, **probarla**, **planear y aplicar** la solución, **verificar** que todo funcione y **documentar** lo que se hizo.",
    "Enfoques para buscar la causa: **ascendente** (de la capa física hacia arriba), **descendente** (de la aplicación hacia abajo) y **divide y vencerás** (empezar en una capa intermedia, por ejemplo con un ping). Si el problema está fuera de tu alcance, se **escala** a alguien con más experiencia.",
  ], [
    "Pasos: identificar, teoría, probar, solucionar, verificar y documentar.",
    "Enfoques: ascendente, descendente y divide y vencerás.",
    "Escalar cuando el problema supera tu alcance.",
  ]),
  L("17.7", [
    "Problemas típicos: **discordancia de dúplex** (un extremo en full y otro en half: lentitud y errores), **problemas de direccionamiento IP** (IP o máscara incorrecta, IP duplicada, gateway equivocado), una PC con **169.254.x.x** (no alcanzó al servidor DHCP) y **fallas de DNS** (funciona el ping por IP pero no por nombre).",
    "Para cada síntoma hay una pista: si `ping 8.8.8.8` funciona pero `ping www.google.com` no, revisa el DNS; si ni el gateway responde, el problema está en tu red local o en tu propia configuración.",
  ], [
    "Discordancia de dúplex → lentitud y errores.",
    "169.254.x.x → problema con DHCP.",
    "Ping por IP sí pero por nombre no → problema de DNS.",
  ]),
];
