import { L } from "./types";

export const LESSONS_1_4 = [
  /* ───────── Módulo 1 · Las redes en la actualidad ───────── */
  L("1.1", [
    "Una **red de computadoras** es un conjunto de dispositivos conectados que pueden intercambiar información. Cuando mandas un mensaje, ves un video o entregas una tarea en línea, tus datos viajan por muchas redes conectadas entre sí: eso es **Internet**, la \"red de redes\".",
    "Las redes cambiaron la forma en que aprendemos (clases en línea, bibliotecas digitales), trabajamos (oficinas remotas, nube), nos comunicamos (mensajería, videollamadas) y nos divertimos (juegos en línea, streaming). Ya no importa tanto dónde estés, sino si estás conectado.",
  ], [
    "Una red conecta dispositivos para compartir información y recursos.",
    "Internet es una red global formada por millones de redes interconectadas.",
    "Las redes eliminan barreras de distancia para estudiar, trabajar y comunicarse.",
  ], "Cuando tu maestro sube una tarea a la plataforma escolar y tú la descargas en casa, la información cruzó la red de la escuela, la de tu proveedor de Internet y la de tu casa."),
  L("1.2", [
    "Toda red tiene tres tipos de componentes. Los **dispositivos finales** (o hosts) son donde nace o termina un mensaje: laptops, teléfonos, servidores, impresoras de red. Cada uno se identifica con una dirección.",
    "Los **dispositivos intermediarios** conectan a los hosts y deciden por dónde viaja la información: **switches** (conectan equipos en la misma red local), **routers** (conectan redes distintas), puntos de acceso inalámbrico y firewalls (filtran tráfico por seguridad).",
    "Los **medios** son el camino físico por donde viajan las señales: cables de cobre, fibra óptica o el aire (ondas de radio en Wi-Fi). Un **servidor** ofrece un servicio (páginas web, correo) y un **cliente** lo solicita; un mismo equipo puede ser ambos.",
  ], [
    "Dispositivos finales: originan o reciben los mensajes (hosts).",
    "Dispositivos intermediarios: switches, routers, puntos de acceso y firewalls.",
    "Medios: cobre, fibra óptica e inalámbrico.",
    "Cliente pide un servicio; servidor lo ofrece.",
  ], "En el correo postal, tú y tu amigo son los dispositivos finales, las oficinas de correo son los intermediarios y los camiones o aviones son los medios."),
  L("1.3", [
    "Para planear y documentar una red se usan **diagramas de topología**: dibujos con íconos estándar para routers, switches, PCs y servidores, unidos por líneas que representan los enlaces.",
    "Hay dos tipos de diagrama. El **diagrama de topología física** muestra dónde están realmente los equipos y los cables (edificio, salón, rack). El **diagrama de topología lógica** muestra cómo se organiza la red: qué dispositivos hay, sus puertos y su direccionamiento IP.",
    "Las tarjetas de red (**NIC**), los **puertos** físicos de los equipos y las **interfaces** (puertos de red de routers y switches) aparecen etiquetados en los diagramas para saber exactamente qué se conecta con qué.",
  ], [
    "Topología física: ubicación real de equipos y cables.",
    "Topología lógica: dispositivos, puertos y direcciones IP.",
    "NIC = tarjeta de red; interfaz = puerto de red de un dispositivo.",
  ], "Un plano de tu escuela con la ubicación de cada salón es como una topología física; un organigrama que muestra quién depende de quién se parece a una topología lógica."),
  L("1.4", [
    "Las redes se clasifican por tamaño. Una **LAN** (red de área local) cubre un área pequeña —una casa, una escuela, una oficina— y la administra una sola organización, con velocidades altas. Una **WAN** (red de área extensa) une LANs que están lejos, normalmente con enlaces de un proveedor de telecomunicaciones.",
    "**Internet** es la WAN más grande del mundo; nadie es su dueño, aunque organizaciones como el IETF y la ICANN coordinan estándares y nombres. Una **intranet** es una red privada para los miembros de una organización y una **extranet** da acceso seguro a parte de ella a personas externas, como proveedores.",
  ], [
    "LAN: área pequeña, una sola organización, alta velocidad.",
    "WAN: conecta LANs a grandes distancias mediante un proveedor.",
    "Intranet = solo miembros; extranet = también socios externos autorizados.",
  ], "La red de tu escuela es una LAN; si la escuela tiene varios planteles en distintas ciudades, la conexión entre ellos es una WAN."),
  L("1.5", [
    "Para salir a Internet, una casa o empresa se conecta a un **ISP** (proveedor de servicios de Internet). En el hogar son comunes el **cable** (usa la red de televisión), **DSL** (usa la línea telefónica), la **fibra hasta el hogar**, la **red celular** y el **satélite** en zonas rurales.",
    "Las empresas necesitan más velocidad y confiabilidad, así que contratan **líneas dedicadas** (un enlace reservado solo para ellas), **Metro Ethernet**, DSL empresarial o enlaces satelitales. Antes cada servicio (teléfono, TV, datos) usaba su propia red; hoy tienden a viajar juntos por una **red convergente**.",
  ], [
    "Hogar: cable, DSL, fibra, celular y satélite.",
    "Empresa: líneas dedicadas, Metro Ethernet, DSL empresarial.",
    "Red convergente: voz, video y datos por la misma infraestructura.",
  ]),
  L("1.6", [
    "Una red confiable cumple cuatro características. La **tolerancia a fallas** significa que, si se cae un enlace o un equipo, el tráfico puede tomar otro camino (redundancia). En las redes de **conmutación de paquetes** los mensajes se dividen en partes que pueden viajar por rutas distintas.",
    "La **escalabilidad** permite crecer —más usuarios, más servicios— sin afectar a los que ya existen. La **calidad de servicio (QoS)** da prioridad al tráfico sensible al retraso, como voz y video. La **seguridad** protege la información con tres metas: **confidencialidad** (solo la ven quienes deben), **integridad** (no se altera) y **disponibilidad** (está ahí cuando se necesita).",
  ], [
    "Tolerancia a fallas: caminos redundantes.",
    "Escalabilidad: crecer sin afectar a los usuarios actuales.",
    "QoS: prioridad a voz y video.",
    "Seguridad: confidencialidad, integridad y disponibilidad (CIA).",
  ], "Si una calle está cerrada, el tráfico toma otra ruta para llegar al mismo destino: eso es tolerancia a fallas."),
  L("1.7", [
    "Varias tendencias cambian las redes. **BYOD** (trae tu propio dispositivo) permite usar tu teléfono o laptop en la red de la escuela o el trabajo. La **colaboración en línea** (documentos compartidos, videollamadas) y el **video** se han vuelto parte de la vida diaria.",
    "La **computación en la nube** guarda datos y programas en centros de datos a los que accedes por Internet; puede ser pública, privada, híbrida o comunitaria. También crecen las **redes domésticas inteligentes**, las **redes por la línea eléctrica** (powerline) y la **banda ancha inalámbrica** para zonas sin cable.",
  ], [
    "BYOD: dispositivos personales en redes de la organización.",
    "La nube: servicios y datos en centros de datos accesibles por Internet.",
    "Tipos de nube: pública, privada, híbrida y comunitaria.",
  ]),
  L("1.8", [
    "Las amenazas pueden ser **externas** —virus, gusanos, troyanos, programas espía, ataques de día cero, ataques de denegación de servicio (DoS), robo de identidad— o **internas**, como un empleado descuidado o malintencionado o un dispositivo perdido.",
    "No existe una sola solución: la seguridad se construye por **capas**. En casa basta un antivirus y un firewall personal; una empresa añade firewalls dedicados, listas de control de acceso (ACL), sistemas de prevención de intrusos (IPS) y redes privadas virtuales (VPN) para el trabajo remoto.",
  ], [
    "Amenazas externas: malware, DoS, robo de datos.",
    "Amenazas internas: errores o mala intención de usuarios legítimos.",
    "La seguridad se aplica en capas: antivirus, firewall, ACL, IPS, VPN.",
  ]),
  L("1.9", [
    "Las redes necesitan profesionales que las diseñen, instalen, aseguren y reparen. La certificación **CCNA** de Cisco demuestra conocimientos básicos de redes y es un punto de partida común para empleos de soporte técnico, administración de redes y ciberseguridad.",
    "Además de lo técnico, un buen profesional de TI documenta su trabajo, sigue un método para resolver problemas y se mantiene actualizado, porque la tecnología cambia constantemente.",
  ], [
    "Las certificaciones validan habilidades ante empleadores.",
    "Áreas de trabajo: soporte, administración de redes, ciberseguridad, nube.",
    "Documentar y aprender continuamente es parte del trabajo.",
  ]),

  /* ───────── Módulo 2 · Configuración básica de switches y terminales ───────── */
  L("2.1", [
    "Todo dispositivo de red tiene un **sistema operativo**. En los equipos Cisco se llama **IOS**. Tiene un núcleo (kernel) que controla el hardware y una interfaz con la que el usuario da órdenes: la **CLI** (interfaz de línea de comandos), donde escribes comandos de texto.",
    "Puedes entrar a la CLI de tres formas: por el **puerto de consola** (un cable directo; sirve aunque el equipo no tenga red configurada), por **SSH** (acceso remoto cifrado, el recomendado) o por **Telnet** (remoto pero sin cifrar, inseguro). Para la consola se usa un programa emulador de terminal como PuTTY o Tera Term.",
  ], [
    "IOS es el sistema operativo de los equipos Cisco.",
    "CLI: se configura escribiendo comandos.",
    "Acceso: consola (local), SSH (remoto seguro), Telnet (remoto inseguro).",
  ]),
  L("2.2", [
    "IOS tiene **modos** con distintos permisos. El **EXEC usuario** (prompt `Switch>`) solo permite ver información básica. Con `enable` pasas al **EXEC privilegiado** (`Switch#`), donde puedes ver todo y reiniciar el equipo.",
    "Para cambiar la configuración entras al **modo de configuración global** con `configure terminal` (`Switch(config)#`). Desde ahí entras a submodos, como el de interfaz con `interface` (`Switch(config-if)#`) o el de línea con `line console 0`. `exit` regresa un nivel y `end` vuelve directo al modo privilegiado.",
  ], [
    "`>` = EXEC usuario; `#` = EXEC privilegiado.",
    "`enable` sube a privilegiado; `configure terminal` entra a configuración global.",
    "`exit` sube un nivel; `end` regresa al modo privilegiado.",
  ], "Es como un edificio con llaves: el vestíbulo (modo usuario) está abierto, pero para entrar a las oficinas (privilegiado) y al cuarto de máquinas (configuración) necesitas más permisos."),
  L("2.3", [
    "Un comando tiene una **palabra clave** (lo que quieres hacer) y a veces **argumentos** (los valores que tú eliges). En `hostname SW-Aula`, \"hostname\" es la palabra clave y \"SW-Aula\" el argumento.",
    "IOS ayuda mucho: escribe `?` para ver los comandos posibles, usa **Tab** para completar una palabra, y puedes **abreviar** si no hay ambigüedad (`conf t` = `configure terminal`). Las flechas recuperan comandos anteriores. Si te equivocas, IOS marca el error con `^` y un mensaje como `% Invalid input detected`.",
  ], [
    "Comando = palabra clave + argumentos.",
    "`?` muestra ayuda según el contexto; Tab completa.",
    "Se pueden abreviar los comandos mientras no sean ambiguos.",
  ]),
  L("2.4", [
    "Lo primero al configurar un equipo es darle un **nombre** con `hostname`, para identificarlo en la red y en el prompt. Después se protegen los accesos con contraseñas: la de la consola (`line console 0`, `password`, `login`), la del modo privilegiado (`enable secret`, que se guarda cifrada) y la de las líneas remotas (`line vty 0 15`).",
    "El comando `service password-encryption` cifra las contraseñas que quedarían en texto plano en la configuración, y `banner motd` muestra un aviso legal a quien se conecte. Usa contraseñas largas y difíciles de adivinar.",
  ], [
    "`hostname` asigna el nombre del equipo.",
    "`enable secret` protege el modo privilegiado con una contraseña cifrada.",
    "`service password-encryption` oculta contraseñas en texto plano.",
    "`banner motd` muestra un aviso al conectarse.",
  ]),
  L("2.5", [
    "Un equipo Cisco tiene dos configuraciones. La **running-config** es la que está funcionando en este momento y vive en la **RAM**: si se apaga el equipo, se pierde. La **startup-config** se guarda en la **NVRAM** y se carga cada vez que el equipo enciende.",
    "Para conservar los cambios usa `copy running-config startup-config`. Si te equivocaste y no has guardado, puedes reiniciar con `reload` para volver a la configuración guardada; para borrarla por completo existe `erase startup-config`.",
  ], [
    "running-config: en RAM, se pierde al apagar.",
    "startup-config: en NVRAM, se carga al encender.",
    "`copy running-config startup-config` guarda los cambios.",
  ], "La running-config es como un documento abierto sin guardar; la startup-config es el archivo guardado en el disco."),
  L("2.6", [
    "Para comunicarse, cada dispositivo final necesita una **dirección IP**: un identificador lógico de 32 bits en IPv4 (por ejemplo, `192.168.10.20`) o de 128 bits en IPv6. Junto con la **máscara de subred**, la IP indica a qué red pertenece el equipo.",
    "Los dispositivos tienen **puertos físicos** (donde se conecta el cable) e **interfaces**. Un switch de capa 2 no necesita IP para reenviar tramas, pero se le puede dar una en una **interfaz virtual de switch (SVI)**, como la VLAN 1, para administrarlo a distancia.",
  ], [
    "La IP identifica al equipo de forma lógica; la máscara indica su red.",
    "IPv4 usa 32 bits; IPv6 usa 128 bits.",
    "La SVI (interfaz VLAN) permite administrar un switch de forma remota.",
  ]),
  L("2.7", [
    "Una PC necesita cuatro datos: **dirección IP**, **máscara de subred**, **gateway predeterminado** (el router para salir de su red) y **servidor DNS** (para traducir nombres a IP). Se pueden poner a mano (**configuración estática**) o recibirlos automáticamente de un servidor **DHCP**.",
    "En un switch, la IP de administración se configura en la SVI: `interface vlan 1`, `ip address 192.168.1.2 255.255.255.0` y `no shutdown` para encenderla. Lo estático conviene para servidores e impresoras; DHCP es lo práctico para la mayoría de los usuarios.",
  ], [
    "Datos de red de una PC: IP, máscara, gateway y DNS.",
    "Estático: se escribe a mano; dinámico: lo asigna DHCP.",
    "Switch: `interface vlan 1` + `ip address` + `no shutdown`.",
  ]),
  L("2.8", [
    "Después de configurar, hay que **verificar**. En Windows, `ipconfig` muestra la IP, la máscara y el gateway de la PC. En el switch, `show ip interface brief` resume las interfaces y si están activas (`up`).",
    "El comando **`ping`** envía mensajes de prueba a otra dirección: si regresan respuestas, hay conectividad de extremo a extremo. Es la primera herramienta para saber si dos equipos pueden comunicarse.",
  ], [
    "`ipconfig` (Windows) muestra la configuración IP de la PC.",
    "`show ip interface brief` resume el estado de las interfaces.",
    "`ping` prueba la conectividad entre dos equipos.",
  ]),

  /* ───────── Módulo 3 · Protocolos y modelos ───────── */
  L("3.1", [
    "Toda comunicación necesita tres elementos: un **emisor**, un **receptor** y un **canal** o medio. Además, ambos deben seguir **reglas** acordadas, igual que al platicar: hablar el mismo idioma, no hablar todos a la vez y confirmar que te entendieron.",
    "En redes, las reglas definen la **codificación** del mensaje, su **formato y encapsulamiento**, su **tamaño**, el **momento** de enviarlo (control de flujo, tiempo de espera) y las **opciones de entrega**: **unicast** (a uno), **multicast** (a un grupo) o **broadcast** (a todos).",
  ], [
    "Comunicación = emisor + receptor + canal + reglas.",
    "Las reglas cubren codificación, formato, tamaño, tiempo y entrega.",
    "Entrega: unicast (uno), multicast (grupo), broadcast (todos).",
  ]),
  L("3.2", [
    "Un **protocolo** es un conjunto de reglas que define cómo se comunican los dispositivos. Los protocolos especifican el formato de los mensajes, cómo se direccionan, cómo se garantiza la entrega, cómo se controla el flujo y qué hacer ante errores.",
    "Cada protocolo hace un trabajo específico y colabora con otros. Por ejemplo, para ver una página web intervienen **HTTP** (pide la página), **TCP** (asegura que llegue completa), **IP** (la lleva entre redes) y **Ethernet** (la mueve dentro de la red local).",
  ], [
    "Protocolo: reglas comunes de comunicación.",
    "Definen formato, direccionamiento, confiabilidad, flujo y errores.",
    "Los protocolos trabajan juntos: HTTP + TCP + IP + Ethernet.",
  ]),
  L("3.3", [
    "Un grupo de protocolos que trabajan juntos se llama **suite de protocolos**. La más importante hoy es **TCP/IP**, la base de Internet. Es **abierta**: cualquiera puede usarla sin pagar, y sus estándares se publican como documentos **RFC**.",
    "TCP/IP incluye protocolos de aplicación (HTTP, DNS, DHCP, SMTP), de transporte (TCP, UDP), de Internet (IPv4, IPv6, ICMP) y de acceso a la red (Ethernet, Wi-Fi). Existieron otras suites, como AppleTalk o Novell, pero casi desaparecieron.",
  ], [
    "Suite de protocolos: conjunto de protocolos que colaboran.",
    "TCP/IP es la suite estándar y abierta de Internet.",
    "Sus estándares se publican como RFC.",
  ]),
  L("3.4", [
    "Los **estándares abiertos** permiten que equipos de distintos fabricantes funcionen juntos. Varias organizaciones los crean: el **IETF** (protocolos de Internet, publicados como RFC), el **IEEE** (Ethernet 802.3, Wi-Fi 802.11), la **ISO** (el modelo OSI), la **ICANN/IANA** (asignación de direcciones IP, nombres de dominio y números de puerto) y la **TIA/EIA** (cableado).",
    "Gracias a estos estándares, una laptop de una marca puede conectarse a un router de otra y a un servidor de una tercera sin problemas.",
  ], [
    "IETF → protocolos de Internet (RFC).",
    "IEEE → Ethernet y Wi-Fi (familia 802).",
    "ICANN/IANA → direcciones IP, dominios y puertos.",
    "TIA/EIA → estándares de cableado.",
  ]),
  L("3.5", [
    "Los **modelos de referencia** dividen la comunicación en **capas**, cada una con una tarea. El **modelo OSI** tiene 7: física (1), enlace de datos (2), red (3), transporte (4), sesión (5), presentación (6) y aplicación (7). Sirve para explicar y para diagnosticar problemas por partes.",
    "El **modelo TCP/IP** tiene 4 capas: acceso a la red (equivale a OSI 1 y 2), Internet (OSI 3), transporte (OSI 4) y aplicación (OSI 5, 6 y 7). Dividir en capas permite cambiar una tecnología —por ejemplo, de cable a Wi-Fi— sin rehacer todo lo demás.",
  ], [
    "OSI: 7 capas (Física, Enlace, Red, Transporte, Sesión, Presentación, Aplicación).",
    "TCP/IP: 4 capas (Acceso a la red, Internet, Transporte, Aplicación).",
    "Las capas permiten cambiar una parte sin afectar a las demás.",
  ], "Mnemotecnia de abajo hacia arriba: \"Fíjate En Remar Todos Siempre Por Arriba\" (Física, Enlace, Red, Transporte, Sesión, Presentación, Aplicación)."),
  L("3.6", [
    "Los mensajes largos se dividen en partes pequeñas (**segmentación**). Así varias conversaciones comparten la red al mismo tiempo (**multiplexación**) y, si algo se pierde, solo se reenvía una parte.",
    "Al bajar por las capas, cada una agrega su propia información de control: esto es **encapsular**. Los datos se convierten en **segmento** (transporte), luego en **paquete** (red), después en **trama** (enlace) y finalmente en **bits** (física). Al recibir, el proceso inverso se llama **desencapsular**. Cada forma se llama **PDU** (unidad de datos del protocolo).",
  ], [
    "Segmentar: dividir el mensaje en partes pequeñas.",
    "Encapsular: cada capa agrega su encabezado al enviar.",
    "PDU: Datos → Segmento → Paquete → Trama → Bits.",
  ], "Es como enviar un regalo: lo envuelves (encabezado de transporte), lo metes en una caja con dirección (red) y el repartidor le pone su etiqueta de ruta local (enlace)."),
  L("3.7", [
    "En una red se usan dos tipos de direcciones. La **dirección IP** (capa 3) identifica al equipo de origen y destino **final**, aunque estén en redes distintas, y no cambia durante el viaje.",
    "La **dirección MAC** (capa 2) identifica a la tarjeta de red y solo sirve **dentro de la red local**. Si el destino está en otra red, la trama se envía a la MAC del **gateway predeterminado** (el router). En cada salto, el router quita la trama vieja y crea una nueva con nuevas MAC, mientras las IP se mantienen.",
  ], [
    "IP: origen y destino finales; se mantiene de extremo a extremo.",
    "MAC: entrega dentro de la red local; cambia en cada salto.",
    "Para otra red, la trama va a la MAC del gateway.",
  ], "La IP es la dirección de la casa a la que va la carta; la MAC es como el nombre de la persona que la entrega en cada tramo del viaje."),

  /* ───────── Módulo 4 · Capa física ───────── */
  L("4.1", [
    "La **capa física** convierte los bits de una trama en **señales** que viajan por un medio, y en el otro extremo las vuelve a convertir en bits. Para conectarte necesitas una **tarjeta de red (NIC)** cableada o inalámbrica.",
    "Esta capa no entiende de direcciones ni de mensajes: solo se ocupa de transmitir unos y ceros de la forma más confiable posible.",
  ], [
    "Convierte bits en señales y viceversa.",
    "Se necesita una NIC para conectarse al medio.",
    "No usa direcciones: solo transmite bits.",
  ]),
  L("4.2", [
    "La capa física tiene tres áreas: los **componentes físicos** (cables, conectores, NIC), la **codificación** (cómo se representan los bits, por ejemplo con cambios de voltaje) y la **señalización** (si son pulsos eléctricos, de luz o de radio).",
    "El **ancho de banda** es la capacidad de un medio para transportar datos, medida en bits por segundo (b/s, Mb/s, Gb/s). El **rendimiento (throughput)** es lo que realmente se logra, que suele ser menor por la **latencia** (retraso), la cantidad de tráfico y el tipo de datos. El **goodput** solo cuenta los datos útiles, sin encabezados.",
  ], [
    "Ancho de banda: capacidad teórica en bits por segundo.",
    "Rendimiento (throughput): velocidad real medida.",
    "La latencia es el tiempo que tardan los datos en llegar.",
  ], "Una autopista de 4 carriles tiene una capacidad (ancho de banda), pero en hora pico avanzas menos (rendimiento)."),
  L("4.3", [
    "El **cableado de cobre** es el más usado por ser barato y fácil de instalar. Transporta señales eléctricas, por eso es sensible a la **interferencia electromagnética (EMI)**, a la **interferencia de radiofrecuencia (RFI)** y a la **diafonía** (la señal de un hilo se cuela en otro). También sufre **atenuación**: la señal se debilita con la distancia.",
    "Hay tres tipos: **UTP** (par trenzado sin blindaje, el más común), **STP** (par trenzado blindado, para ambientes con mucho ruido) y **coaxial** (usado en TV por cable e Internet por cable).",
  ], [
    "El cobre sufre EMI, RFI, diafonía y atenuación.",
    "Tipos: UTP, STP y coaxial.",
    "La longitud máxima evita que la señal se debilite demasiado.",
  ]),
  L("4.4", [
    "El **UTP** tiene 8 hilos de cobre en 4 pares de colores trenzados. El trenzado produce un **efecto de cancelación**: el ruido afecta por igual a los dos hilos del par y se anula. Se conecta con el conector **RJ-45** y su longitud máxima en Ethernet es de **100 metros**.",
    "El orden de los hilos sigue la norma **TIA/EIA-568** (T568A o T568B). Un **cable directo** usa la misma norma en ambos extremos y conecta equipos distintos (PC–switch). Un **cable cruzado** usa una norma distinta en cada punta y conecta equipos iguales (switch–switch), aunque hoy muchos equipos tienen **auto-MDIX** y detectan solos el tipo de cable.",
  ], [
    "UTP: 4 pares trenzados, conector RJ-45, máximo 100 m.",
    "T568B: blanco-naranja, naranja, blanco-verde, azul, blanco-azul, verde, blanco-marrón, marrón.",
    "Directo: equipos distintos. Cruzado: equipos iguales (sin auto-MDIX).",
  ]),
  L("4.5", [
    "La **fibra óptica** transmite pulsos de **luz** por un hilo muy delgado de vidrio. Por eso es **inmune a la interferencia electromagnética**, alcanza distancias muy grandes y tiene un ancho de banda enorme. Es más cara y delicada de instalar.",
    "La **fibra monomodo** tiene un núcleo muy delgado, usa **láser** y llega a decenas de kilómetros. La **multimodo** tiene un núcleo más grueso, usa **LED** y es para distancias menores (cientos de metros). Se usa en el cableado entre edificios, en las redes de los proveedores y en la fibra hasta el hogar.",
  ], [
    "Transmite luz: inmune a EMI y RFI.",
    "Monomodo: láser, grandes distancias.",
    "Multimodo: LED, distancias cortas, más económica.",
  ]),
  L("4.6", [
    "Los **medios inalámbricos** usan ondas de radio o microondas, así que dan movilidad sin cables. Sus retos son la **cobertura** (paredes y materiales debilitan la señal), la **interferencia** de otros aparatos y la **seguridad**, porque cualquiera cercano puede intentar captar la señal.",
    "Los estándares principales son **Wi-Fi (IEEE 802.11)** para redes locales, **Bluetooth (IEEE 802.15)** para distancias cortas y **WiMAX (IEEE 802.16)**. Una red Wi-Fi usa un **punto de acceso** o router inalámbrico y tarjetas de red inalámbricas en los dispositivos.",
  ], [
    "Ventaja: movilidad. Retos: cobertura, interferencia y seguridad.",
    "Wi-Fi = IEEE 802.11; Bluetooth = IEEE 802.15.",
    "El punto de acceso conecta los equipos inalámbricos a la red.",
  ]),
];
