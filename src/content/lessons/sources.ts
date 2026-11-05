/**
 * Referencias bibliográficas por módulo. El contenido de las lecciones es una redacción original
 * para estudiantes, apoyada en estas obras y estándares (no se copian textos).
 */
const TANENBAUM = "Tanenbaum, A. S. y Wetherall, D. J. (2012). Redes de computadoras (5.ª ed.). Pearson Educación.";
const KUROSE = "Kurose, J. F. y Ross, K. W. (2017). Redes de computadoras: un enfoque descendente (7.ª ed.). Pearson Educación.";
const FOROUZAN = "Forouzan, B. A. (2007). Transmisión de datos y redes de comunicaciones (4.ª ed.). McGraw-Hill.";
const STALLINGS = "Stallings, W. (2004). Comunicaciones y redes de computadores (7.ª ed.). Pearson Educación.";
const ODOM = "Odom, W. (2019). CCNA 200-301 Official Cert Guide, Volume 1. Cisco Press.";
const CISCO_IOS = "Cisco Systems. Cisco IOS Configuration Fundamentals Configuration Guide. Documentación oficial en cisco.com.";

export const SOURCES: Record<number, string[]> = {
  1: [TANENBAUM + " Cap. 1: Introducción.", KUROSE + " Cap. 1: Redes de computadoras e Internet.", "Cisco Systems. Annual Internet Report (2018–2023). Libro blanco."],
  2: [ODOM + " Partes I y II: uso de la CLI y configuración básica de switches.", CISCO_IOS, "IETF. RFC 4251: The Secure Shell (SSH) Protocol Architecture (2006)."],
  3: ["ISO/IEC 7498-1:1994. Information technology — Open Systems Interconnection — Basic Reference Model.", TANENBAUM + " Cap. 1, secc. 1.4: Modelos de referencia.", KUROSE + " Cap. 1, secc. 1.5: Capas de protocolos.", "IETF. RFC 1122: Requirements for Internet Hosts — Communication Layers (1989)."],
  4: [STALLINGS + " Caps. 3–4: transmisión de datos y medios de transmisión.", FOROUZAN + " Caps. 3 y 7: datos, señales y medios de transmisión.", "ANSI/TIA-568.2-D (2018). Balanced Twisted-Pair Telecommunications Cabling and Components Standard.", "IEEE 802.3-2022. Standard for Ethernet. / IEEE 802.11-2020. Wireless LAN."],
  5: [FOROUZAN + " Apéndice B: sistemas numéricos.", "IETF. RFC 791: Internet Protocol (1981), formato de direcciones.", "IETF. RFC 5952: A Recommendation for IPv6 Address Text Representation (2010)."],
  6: [TANENBAUM + " Caps. 3–4: la capa de enlace de datos y la subcapa MAC.", KUROSE + " Cap. 6: la capa de enlace y las redes de área local.", "IEEE 802.3-2022. Standard for Ethernet. / IEEE 802.2: Logical Link Control."],
  7: ["IEEE 802.3-2022. Standard for Ethernet (formato de trama).", "IEEE 802.1D-2004. MAC Bridges (aprendizaje y reenvío).", "IEEE (2017). Guidelines for Use of Extended Unique Identifier (EUI), OUI and CID.", KUROSE + " Cap. 6, secc. 6.4: redes de área local conmutadas."],
  8: ["IETF. RFC 791: Internet Protocol (1981).", "IETF. RFC 8200: Internet Protocol, Version 6 (IPv6) Specification (2017).", KUROSE + " Cap. 4: la capa de red: plano de datos.", TANENBAUM + " Cap. 5: la capa de red."],
  9: ["IETF. RFC 826: An Ethernet Address Resolution Protocol (1982).", "IETF. RFC 4861: Neighbor Discovery for IP version 6 (2007).", KUROSE + " Cap. 6, secc. 6.4.1: direcciones de la capa de enlace y ARP."],
  10: [ODOM + " Parte III: configuración de routers e interfaces.", CISCO_IOS, KUROSE + " Cap. 4, secc. 4.2: ¿qué hay dentro de un router?"],
  11: ["IETF. RFC 791: Internet Protocol (1981).", "IETF. RFC 950: Internet Standard Subnetting Procedure (1985).", "IETF. RFC 1918: Address Allocation for Private Internets (1996).", "IETF. RFC 3927: Dynamic Configuration of IPv4 Link-Local Addresses (2005).", "IETF. RFC 4632: Classless Inter-domain Routing (CIDR) (2006).", ODOM + " Parte IV: direccionamiento IPv4 y subredes."],
  12: ["IETF. RFC 8200: IPv6 Specification (2017).", "IETF. RFC 4291: IP Version 6 Addressing Architecture (2006).", "IETF. RFC 5952: IPv6 Address Text Representation (2010).", "IETF. RFC 4862: IPv6 Stateless Address Autoconfiguration (2007).", "IETF. RFC 8415: DHCP for IPv6 (2018)."],
  13: ["IETF. RFC 792: Internet Control Message Protocol (1981).", "IETF. RFC 4443: ICMPv6 (2006).", KUROSE + " Cap. 5, secc. 5.6: ICMP."],
  14: ["IETF. RFC 9293: Transmission Control Protocol (TCP) (2022).", "IETF. RFC 768: User Datagram Protocol (1980).", "IETF. RFC 6335: Procedures for the Management of the Service Name and Transport Protocol Port Number Registry (2011).", KUROSE + " Cap. 3: la capa de transporte."],
  15: ["IETF. RFC 1034 y RFC 1035: Domain Names (1987).", "IETF. RFC 2131: Dynamic Host Configuration Protocol (1997).", "IETF. RFC 9110: HTTP Semantics (2022). / RFC 5321: SMTP (2008).", "IETF. RFC 1939: POP3 (1996). / RFC 9051: IMAP4rev2 (2021). / RFC 959: FTP (1985).", KUROSE + " Cap. 2: la capa de aplicación."],
  16: ["NIST SP 800-12 Rev. 1 (2017). An Introduction to Information Security.", "NIST SP 800-83 Rev. 1 (2013). Guide to Malware Incident Prevention and Handling.", "IETF. RFC 4251–4254: protocolo SSH (2006).", KUROSE + " Cap. 8: seguridad en redes de computadoras.", ODOM + " Parte VI: seguridad de dispositivos."],
  17: [ODOM + " Parte VII: administración y solución de problemas.", KUROSE + " Cap. 9: redes multimedia (requisitos de tráfico sensible al retardo).", "Cisco Systems. Troubleshooting methodologies (documentación técnica en cisco.com)."],
};
