import { L } from "./types";

export const LESSONS_5_10 = [
  /* ───────── Módulo 5 · Sistemas numéricos ───────── */
  L("5.1", [
    "Las computadoras trabajan con **bits**: valores que solo pueden ser 0 o 1. El sistema **binario** es de base 2, así que cada posición vale el doble que la de su derecha. En un **octeto** (8 bits) los valores son 128, 64, 32, 16, 8, 4, 2 y 1.",
    "Para pasar de **binario a decimal**, suma los valores donde haya un 1: `11000000` = 128 + 64 = **192**. Para pasar de **decimal a binario**, resta de izquierda a derecha: 172 − 128 = 44 (1), no cabe 64 (0), 44 − 32 = 12 (1), no cabe 16 (0), 12 − 8 = 4 (1), 4 − 4 = 0 (1), y el resto 0 → `10101100`.",
    "Una dirección IPv4 tiene 32 bits divididos en 4 octetos; por eso cada número de la IP va de **0 a 255** (255 = `11111111`).",
  ], [
    "Binario = base 2; cada bit vale el doble que el de su derecha.",
    "Valores de un octeto: 128, 64, 32, 16, 8, 4, 2, 1.",
    "Una IPv4 = 32 bits = 4 octetos de 0 a 255.",
  ], "Piensa en 8 focos con etiquetas 128…1: para formar un número, prende los focos cuya suma dé ese valor."),
  L("5.2", [
    "El sistema **hexadecimal** es de base 16. Usa los dígitos 0–9 y las letras **A (10), B (11), C (12), D (13), E (14) y F (15)**. Cada dígito hexadecimal representa exactamente **4 bits** (un *nibble*), así que un octeto se escribe con 2 dígitos: `11111111` = `FF` = 255.",
    "Para convertir, separa el binario en grupos de 4: `1010 1100` = `A` `C` = **0xAC** = 10 × 16 + 12 = 172. Hexadecimal se usa en las **direcciones MAC** (`00-1A-2B-3C-4D-5E`) y en las **direcciones IPv6**, porque es mucho más corto que escribir binario.",
  ], [
    "Hexadecimal = base 16: 0–9 y A–F.",
    "1 dígito hexadecimal = 4 bits; 1 octeto = 2 dígitos.",
    "Se usa en direcciones MAC e IPv6.",
  ]),

  /* ───────── Módulo 6 · Capa de enlace de datos ───────── */
  L("6.1", [
    "La **capa de enlace de datos** prepara los paquetes para viajar por un medio físico concreto. Los **encapsula en tramas**, controla cómo se accede al medio y detecta errores. Así, las capas superiores no necesitan saber si la red es cableada o inalámbrica.",
    "En las LAN (IEEE 802) se divide en dos subcapas: **LLC** (control de enlace lógico), que se comunica con la capa de red e indica qué protocolo va dentro, y **MAC** (control de acceso al medio), que se encarga del direccionamiento físico y de cómo se comparte el medio. En cada salto entre redes, el router quita la trama de entrada y crea una nueva para el medio de salida.",
  ], [
    "Encapsula paquetes en tramas y controla el acceso al medio.",
    "Subcapas: LLC (hacia la capa de red) y MAC (hacia el medio).",
    "En cada router la trama se reemplaza; el paquete IP continúa.",
  ]),
  L("6.2", [
    "La **topología física** describe las conexiones reales y la **topología lógica**, cómo circulan las tramas. En las WAN son comunes la **punto a punto** (dos nodos), la **hub and spoke** (un sitio central y sucursales) y la **malla** (muchos sitios unidos entre sí, con gran redundancia). En las LAN predomina la **estrella extendida** con switches.",
    "Un enlace puede ser **half-duplex** (envía o recibe, pero no ambos a la vez) o **full-duplex** (ambos a la vez). Para compartir un medio hay dos enfoques: el **acceso por contienda**, como **CSMA/CD** en la Ethernet antigua con hubs (detecta colisiones) o **CSMA/CA** en Wi-Fi (intenta evitarlas), y el **acceso controlado**, donde cada equipo espera su turno.",
  ], [
    "WAN: punto a punto, hub and spoke y malla. LAN: estrella extendida.",
    "Half-duplex = un sentido a la vez; full-duplex = ambos.",
    "CSMA/CD (Ethernet antigua) detecta colisiones; CSMA/CA (Wi-Fi) las evita.",
  ], "Half-duplex es un walkie-talkie (\"cambio\"); full-duplex es una llamada telefónica."),
  L("6.3", [
    "Una **trama** tiene tres partes: el **encabezado** (direcciones de origen y destino, tipo de protocolo y datos de control), los **datos** (el paquete de la capa 3) y el **tráiler** con la **secuencia de verificación de trama (FCS)**.",
    "El FCS contiene un cálculo llamado **CRC**. El receptor repite el cálculo: si no coincide, sabe que la trama se dañó en el camino y la descarta. Cada tecnología (Ethernet, Wi-Fi, PPP) tiene su propio formato de trama, adaptado a su medio.",
  ], [
    "Trama = encabezado + datos + tráiler.",
    "El FCS (CRC) permite detectar tramas dañadas.",
    "Cada tecnología de enlace tiene su propio formato de trama.",
  ]),

  /* ───────── Módulo 7 · Switching Ethernet ───────── */
  L("7.1", [
    "**Ethernet** es la tecnología de LAN cableada más usada; está definida por el estándar **IEEE 802.3** y trabaja en las capas de enlace y física. Una trama Ethernet mide entre **64 y 1518 bytes**; las más pequeñas son \"runts\" (restos de colisiones) y las más grandes, \"jumbos\" o \"baby giants\".",
    "Sus campos son: **preámbulo** y delimitador de inicio (sincronización), **MAC de destino**, **MAC de origen**, **tipo** (qué protocolo va dentro, por ejemplo `0x0800` para IPv4 o `0x86DD` para IPv6), **datos** y **FCS**.",
  ], [
    "Ethernet = IEEE 802.3, capas 1 y 2.",
    "Trama: de 64 a 1518 bytes.",
    "Campos: preámbulo, MAC destino, MAC origen, tipo, datos y FCS.",
  ]),
  L("7.2", [
    "Una **dirección MAC** tiene **48 bits** (12 dígitos hexadecimales), por ejemplo `00-60-2F-3A-07-BC`. Los primeros 24 bits son el **OUI**, asignado por el IEEE a cada fabricante, y los otros 24 los asigna el fabricante a cada tarjeta.",
    "Hay tres tipos de entrega: **unicast** (a una MAC específica), **broadcast** (`FF-FF-FF-FF-FF-FF`, a todos los equipos de la LAN; por ejemplo, las solicitudes ARP) y **multicast** (a un grupo; en IPv4 las MAC multicast empiezan con `01-00-5E` y en IPv6 con `33-33`).",
  ], [
    "MAC = 48 bits = 12 dígitos hexadecimales.",
    "OUI (24 bits) = fabricante; los otros 24 bits = número de la tarjeta.",
    "Broadcast MAC: FF-FF-FF-FF-FF-FF.",
  ]),
  L("7.3", [
    "Un **switch** aprende solo dónde está cada equipo. Cuando le llega una trama, mira la **MAC de origen** y la anota en su **tabla de direcciones MAC** junto con el puerto por donde entró (o actualiza su temporizador, que normalmente dura 5 minutos).",
    "Después busca la **MAC de destino**: si está en la tabla, envía la trama **solo por ese puerto** (filtrado); si no está, o si es un broadcast o multicast, la **inunda** por todos los puertos excepto por el que llegó. Con el comando `show mac address-table` puedes ver la tabla de un switch Cisco.",
  ], [
    "Aprende con la MAC de origen + puerto de entrada.",
    "Reenvía con la MAC de destino: un puerto si la conoce.",
    "Destino desconocido o broadcast → inunda (menos el puerto de entrada).",
  ], "Es como un recepcionista que anota en qué salón está cada alumno cuando lo ve pasar; si le llega un recado para alguien que no conoce, lo anuncia en todos los salones."),
  L("7.4", [
    "Los switches reenvían de dos maneras. **Almacenamiento y envío (store-and-forward)**: recibe la trama completa, revisa el FCS y descarta las dañadas; es el método de los switches Cisco actuales y permite QoS. **Corte (cut-through)**: empieza a reenviar antes de recibir toda la trama; tiene menos latencia. Sus variantes son **fast-forward** (solo lee la MAC de destino) y **fragment-free** (lee los primeros 64 bytes).",
    "Los switches usan **búferes** de memoria para guardar tramas cuando un puerto está ocupado. Los puertos pueden negociar velocidad y dúplex automáticamente (**autonegociación**); si un extremo queda en full-duplex y el otro en half, hay una **discordancia de dúplex** que causa errores. **Auto-MDIX** detecta solo si el cable es directo o cruzado.",
  ], [
    "Store-and-forward: revisa el FCS antes de reenviar.",
    "Cut-through: menor latencia (fast-forward y fragment-free).",
    "Autonegociación y auto-MDIX simplifican las conexiones.",
  ]),

  /* ───────── Módulo 8 · Capa de red ───────── */
  L("8.1", [
    "La **capa de red** permite que los equipos intercambien datos aunque estén en redes diferentes. Hace cuatro cosas: **direccionar** a los equipos (IP), **encapsular** el segmento en un **paquete**, **enrutar** (elegir el camino) y **desencapsular** al llegar.",
    "El protocolo **IP** tiene tres características: es **sin conexión** (no avisa antes de enviar), de **máximo esfuerzo** (no garantiza la entrega; eso lo hacen capas superiores como TCP) e **independiente del medio** (funciona sobre cobre, fibra o Wi-Fi). Si un paquete es más grande que lo que admite el medio (**MTU**), IPv4 puede **fragmentarlo**.",
  ], [
    "Funciones: direccionar, encapsular, enrutar y desencapsular.",
    "IP: sin conexión, de máximo esfuerzo e independiente del medio.",
    "MTU: tamaño máximo de paquete que admite el medio.",
  ]),
  L("8.2", [
    "El **encabezado IPv4** mide normalmente 20 bytes. Sus campos más importantes son: **versión** (4), **servicios diferenciados (DS)** para QoS, **TTL** (tiempo de vida: cada router le resta 1 y al llegar a 0 descarta el paquete, evitando bucles infinitos), **protocolo** (qué va dentro: 6 = TCP, 17 = UDP, 1 = ICMP), **suma de verificación del encabezado** y las **direcciones IP de origen y destino** de 32 bits.",
    "IPv4 tiene limitaciones: se **agotaron las direcciones**, se necesita **NAT** para que muchas casas compartan una IP pública, y su encabezado es más complejo de procesar.",
  ], [
    "TTL evita que un paquete circule para siempre.",
    "El campo Protocolo indica si lleva TCP (6), UDP (17) o ICMP (1).",
    "IPv4 sufre agotamiento de direcciones y depende de NAT.",
  ]),
  L("8.3", [
    "**IPv6** fue diseñado para reemplazar a IPv4. Ofrece un espacio de direcciones enorme (**128 bits**), un encabezado **más simple** de 40 bytes fijos, no necesita NAT para conectar equipos de extremo a extremo y los routers ya no fragmentan paquetes.",
    "Campos del encabezado IPv6: **versión** (6), **clase de tráfico** (prioridad), **etiqueta de flujo**, **longitud de la carga útil**, **siguiente encabezado** (equivale a \"protocolo\"), **límite de saltos** (equivale al TTL) y las **direcciones de origen y destino** de 128 bits.",
  ], [
    "IPv6: direcciones de 128 bits y encabezado simple de 40 bytes.",
    "Límite de saltos = TTL; siguiente encabezado = protocolo.",
    "No requiere NAT y los routers no fragmentan.",
  ]),
  L("8.4", [
    "Antes de enviar, un equipo decide: si el destino está en **su misma red**, lo entrega directo; si está en **otra red**, lo manda a su **gateway predeterminado** (la IP del router de su LAN). Si un equipo no tiene gateway configurado, solo podrá comunicarse dentro de su red.",
    "Cada equipo tiene su propia **tabla de routing**. En Windows puedes verla con `route print` o `netstat -r`: incluye la red local, la ruta de **loopback** (127.0.0.1) y la **ruta predeterminada** `0.0.0.0` que apunta al gateway.",
  ], [
    "Misma red → entrega directa; otra red → al gateway.",
    "Sin gateway, el equipo no puede salir de su red.",
    "`route print` muestra la tabla de routing de Windows.",
  ]),
  L("8.5", [
    "La **tabla de routing** de un router indica a dónde mandar cada paquete. Tiene **redes directamente conectadas** (las de sus propias interfaces, marcadas con `C` y `L` en Cisco), **rutas remotas** y, opcionalmente, una **ruta predeterminada** (`0.0.0.0/0`, \"si no conozco el destino, envíalo por aquí\").",
    "Las rutas remotas pueden ser **estáticas** (las escribe el administrador; código `S`) o **dinámicas** (los routers las aprenden entre sí con protocolos como **OSPF** (`O`) o **EIGRP** (`D`)). Con `show ip route` se ve la tabla. Si varias rutas coinciden, gana la **más específica** (la de prefijo más largo).",
  ], [
    "C = conectada, L = local, S = estática, O = OSPF, D = EIGRP.",
    "Ruta predeterminada 0.0.0.0/0: el último recurso.",
    "Gana la coincidencia más larga (la más específica).",
  ]),

  /* ───────── Módulo 9 · Resolución de direcciones ───────── */
  L("9.1", [
    "Para entregar un paquete se necesitan dos direcciones. La **IP de destino** dice a qué equipo final va. La **MAC de destino** dice a qué tarjeta de red se entrega la trama **en este tramo**.",
    "Si el destino está en la **misma red**, la MAC de destino es la del propio destino. Si está en **otra red**, la MAC de destino es la del **gateway** (router). Cada router repite el proceso en su siguiente tramo, mientras las IP de origen y destino permanecen iguales.",
  ], [
    "IP = destino final; MAC = siguiente tramo dentro de la LAN.",
    "Destino remoto → la trama va a la MAC del gateway.",
    "Las IP se mantienen; las MAC cambian en cada salto.",
  ]),
  L("9.2", [
    "**ARP** (Protocolo de Resolución de Direcciones) encuentra la MAC que corresponde a una IPv4. El equipo primero busca en su **tabla (caché) ARP**; si no la tiene, envía una **solicitud ARP por broadcast**: \"¿Quién tiene la IP 192.168.1.1? Díselo a 192.168.1.10\". Solo el dueño de esa IP responde, con una **respuesta ARP unicast** que incluye su MAC.",
    "Las entradas de la caché expiran tras un tiempo. En Windows se ven con `arp -a` y en Cisco con `show ip arp`. Como ARP no verifica quién responde, un atacante puede enviar respuestas falsas (**suplantación o envenenamiento ARP**) para hacerse pasar por el gateway e interceptar tráfico.",
  ], [
    "ARP: IPv4 → MAC.",
    "Solicitud por broadcast; respuesta por unicast.",
    "`arp -a` muestra la caché; el envenenamiento ARP es un riesgo.",
  ], "Es como gritar en el salón \"¿Quién es Ana?\" y que solo Ana levante la mano y te diga dónde está sentada."),
  L("9.3", [
    "IPv6 no usa ARP. En su lugar usa **Neighbor Discovery (ND)**, que funciona con mensajes **ICMPv6**. Para resolver direcciones usa la **solicitud de vecino (NS)** y el **anuncio de vecino (NA)**; la solicitud se envía a una dirección **multicast de nodo solicitado**, no a todos, lo que es más eficiente que un broadcast.",
    "ND también sirve para descubrir routers: la **solicitud de router (RS)** y el **anuncio de router (RA)**, que informa el prefijo de la red y el gateway. Además, permite la **detección de direcciones duplicadas (DAD)**.",
  ], [
    "IPv6 usa Neighbor Discovery (ICMPv6) en lugar de ARP.",
    "NS/NA: resolución de direcciones. RS/RA: descubrimiento de routers.",
    "DAD verifica que una dirección no esté repetida.",
  ]),

  /* ───────── Módulo 10 · Configuración básica de un router ───────── */
  L("10.1", [
    "La configuración inicial de un router es parecida a la de un switch: nombre con `hostname`, contraseña cifrada del modo privilegiado con `enable secret`, contraseñas de consola y de las líneas remotas (`line console 0` y `line vty 0 4` con `password` y `login`), `service password-encryption` y un `banner motd` con un aviso legal.",
    "Al terminar, se guarda con `copy running-config startup-config`. Configurar siempre los mismos pasos básicos en todos los equipos es una buena práctica de seguridad y orden.",
  ], [
    "Pasos básicos: hostname, enable secret, contraseñas de consola y VTY.",
    "`service password-encryption` y `banner motd`.",
    "Guardar con `copy running-config startup-config`.",
  ]),
  L("10.2", [
    "Para que un router enrute, sus **interfaces** deben tener dirección IP y estar **encendidas**, porque vienen **apagadas por defecto** (*administratively down*). En el modo de interfaz se usa `ip address <ip> <máscara>` (y `ipv6 address` si aplica), `description` para documentar y `no shutdown` para activarla.",
    "Para verificar: `show ip interface brief` (resumen de IP y estado), `show interfaces` (detalle y errores), `show ip route` (redes conectadas que aparecen al encender las interfaces) y `show running-config`.",
  ], [
    "Las interfaces del router inician apagadas.",
    "`ip address` + `no shutdown` para activar una interfaz.",
    "Verificación: `show ip interface brief` y `show ip route`.",
  ]),
  L("10.3", [
    "El **gateway predeterminado** es la puerta de salida de una red: la IP de la interfaz del router que está en esa misma LAN. Todas las PCs de la red deben tenerlo configurado para comunicarse con otras redes e Internet.",
    "Un switch de capa 2 no enruta, pero si quieres administrarlo desde otra red también necesita un gateway: se configura con `ip default-gateway <ip-del-router>` en el modo de configuración global.",
  ], [
    "Gateway = IP del router en la misma red que las PCs.",
    "Sin gateway, un equipo solo habla dentro de su red.",
    "En switches: `ip default-gateway` para administración remota.",
  ]),
];
