/*
		# ToMaTehhh/script-haxball-discord-recs
		
		# DESCRIPCIÓN:
		# SCRIPT para hacer una afiliación mediante Discord para el envío de estadísticas y grabación.
		
		# PROGRAMACIÓN:
		# by ToMaTeh aka mecánico

*/

// - CONFIGURACIÓN GLOBAL DEL SERVIDOR
var NombreDelServidor =					"Prueba de Base de Datos"; 						// Nombre del servidor.
var MaximaCantidadDeJugadores = 		10; 											// Cantidad de jugadores máx.
var ServidorToken =             		"thr1.AAAAAGokm2-DSVa9DWc0lg.YYSZ4fRjkhQ"; 		// Token del servidor.
var NoQuieroUnRobot =           		true; 											
var SalaPublica =               		true; 											// true = pública, false = privada
var ContraseñaDeLaSala = 				"123";								 			// Si SalaPublica = false, la contraseña es ContraseñaDeLaSala

var LocalizacionDelServidor =   		"AR"; 											// AR = Argentina
var Latitud	=							-38.872;									
var Longitud = 							-58.3819;

var NombreDelBot =              		"Gato de Monitoreo"; 							// Si NoQuieroUnRobot es true, ignorar, si es false se le asigna el nombre de NombreDelBot

// - VARIABLES GLOBALES
var NombreDeLasRec =                    "Prueba_De_Base_De_Datos"; 						// Nombre a asignar a los archivos .hbr2 + Date.now
let segundosTranscurridosHaxball = 		0;
const DISCORD_WEBHOOK_URL = 			""; 											// Simplemente usa el URL que te devuelva tu canal de Discord.

var NombreDelMapaActual = 				"Classic (Predeterminado)"; 					// Var para evitar errores, pero ustedes en la función
																						// de la declaración de partidoActual (mapa:)
																						// usen su setCustomStadium, o sea, la variable
																						// donde el estadio personalizado esté guardado.
																						
																						

// - HBINIT del SERVIDOR
var room = HBInit({
	roomName: NombreDelServidor,
    maxPlayers: MaximaCantidadDeJugadores,
    public: SalaPublica,
	password: ContraseñaDeLaSala,
    noPlayer: NoQuieroUnRobot,
	playerName: NombreDelBot,
    token: ServidorToken,
	geo: {
		code: LocalizacionDelServidor,
		lat: Latitud,
		lon: Longitud,
	}
});

// - COLORES PARA EL CHAT
const AMARILLO = 0xFFEF06;

function MensajeAlIniciar(player) {
    // Limpiar el chat del jugador
    for (let i = 0; i < 20; i++) {
        room.sendAnnouncement("", player.id);
    }

    // Obtener la fecha actual en Argentina
    const opciones = { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' };
	const fechaArgentina = new Date().toLocaleDateString('es-ES', opciones).replace(/ de (\d{4})/, ', $1');
    room.sendAnnouncement("[SISTEMA]  ¡Bienvenido al servidor!", player.id, AMARILLO, "bold", 1);
    room.sendAnnouncement("[SISTEMA]  Usa !help para ver todos los comandos disponibles.", player.id, AMARILLO, "normal", 0);
    room.sendAnnouncement("[SISTEMA]  Hoy es " + fechaArgentina + ".", player.id, AMARILLO, "normal", 0);
};


// - Estructura de control del partido (estadísticas).
let partidoActual = {
    activo: false,
    mapa: "Classic", // ACÁ, LEER ARRIBA.
    duracion: "0:00",
	tiempoInicio: null,  // Usaremos null para detectar cuando se haya capturado
    tiempoFinal: null,   // Capturar tiempo al final
	relojSistemaInicio: null,
	golesRed: 0,
    golesBlue: 0,
    historialGoles: [],
    jugadores: {} 
};

// - SISTEMA DE RASTREO DE BALÓN (Para Goles y Asistencias)
// Guardaremos los objetos de los últimos jugadores que patearon/tocaron el balón
let ultimoToque = null;
let penultimoToque = null;

// Cuando un jugador se une al equipo Red o Blue, le creamos su ficha de estadísticas
room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
    if (changedPlayer.team === 0) return; 

	// Datos para los jugadores
    if (!partidoActual.jugadores[changedPlayer.id]) {
        partidoActual.jugadores[changedPlayer.id] = {
            id: changedPlayer.id,
            name: changedPlayer.name,
            team: changedPlayer.team,
            goles: 0,
            golesEnContra: 0,
            asistencias: 0,
            atajadas: 0,
            toques: 0 
        };
    } else {
        partidoActual.jugadores[changedPlayer.id].team = changedPlayer.team;
    }
};

room.onPlayerLeave = function(player) {
    // Mantenemos los datos por si sale en medio del partido, para el reporte final.
};

// - EVENTOS DE JUEGO

room.onGameStart = function(byPlayer) {
    room.startRecording();
	room.sendAnnouncement("🎥 Grabación (.hbr2) iniciada. ¡Saluden al server de Discord!", null, AMARILLO, "bold");
    console.log("🎥 Grabación (.hbr2) iniciada.");
	
	partidoActual.activo = true;
    partidoActual.duracion = "0:00";
	segundosTranscurridosHaxball = 0; // Reseteamos el contador de tiempo real

    partidoActual.golesRed = 0;
    partidoActual.golesBlue = 0;
    partidoActual.historialGoles = [];
    partidoActual.mapa = NombreDelMapaActual; // Provisional, leer más arriba.
	partidoActual.jugadores = {};
    
    // Resetear el rastreador de toques al sacar del medio
    ultimoToque = null;
    penultimoToque = null;
    
    room.getPlayerList().forEach(player => {
        if (player.team === 1 || player.team === 2) {
            partidoActual.jugadores[player.id] = {
                id: player.id,
                name: player.name,
                team: player.team,
                goles: 0,
                golesEnContra: 0,
                asistencias: 0,
                atajadas: 0,
                toques: 0
            };
        }
    });
};

// Captura cada vez que un jugador patea o toca la pelota
room.onPlayerBallKick = function(player) {
    if (partidoActual.jugadores[player.id]) {
        partidoActual.jugadores[player.id].toques++;
    }
	
    // Lógica de rotación de toques: el que era último pasa a ser penúltimo, y el nuevo pasa a ser el último.
    if (ultimoToque === null || ultimoToque.id !== player.id) {
        penultimoToque = ultimoToque;
        ultimoToque = player;
    }
};

room.onTeamGoal = function(team) {
    const scores = room.getScores();
    if (scores) {
        partidoActual.golesRed = scores.red;
        partidoActual.golesBlue = scores.blue;
        
        const tiempoSegundos = Math.floor(scores.time);
        const mins = Math.floor(tiempoSegundos / 60);
        const secs = tiempoSegundos % 60;
        const tiempoFormateado = `[${mins}:${secs < 10 ? '0' : ''}${secs}]`;

        let mensajeGol = "";

        // ALGORITMO AUTOMÁTICO DE GOLES Y ASISTENCIAS
        if (ultimoToque !== null) {
            // GOL NORMAL (El jugador que tocó la pelota pertenece al equipo que anotó)
            if (ultimoToque.team === team) {
                mensajeGol = `${tiempoFormateado} ⚽ Gol de ${ultimoToque.name}`;
                
                // Sumamos el gol a sus estadísticas en memoria
                if (partidoActual.jugadores[ultimoToque.id]) {
                    partidoActual.jugadores[ultimoToque.id].goles++;
                }

                // Verificamos si hubo asistencia (El penúltimo toque fue del mismo equipo y no es el mismo jugador)
                if (penultimoToque !== null && penultimoToque.team === team && penultimoToque.id !== ultimoToque.id) {
                    mensajeGol += ` | 👟 Asistencia de ${penultimoToque.name}`;
                    if (partidoActual.jugadores[penultimoToque.id]) {
                        partidoActual.jugadores[penultimoToque.id].asistencias++;
                    }
                }
            } 
            // AUTOGOL / GOL EN CONTRA (El jugador la metió en su propio arco)
            else {
                mensajeGol = `${tiempoFormateado} 🤡 Autogol de ${ultimoToque.name}`;
                if (partidoActual.jugadores[ultimoToque.id]) {
                    partidoActual.jugadores[ultimoToque.id].golesEnContra++;
                }
            }
        } else {
            // Caso de respaldo por si el balón entra directo sin toques registrados
            const equipoNombre = team === 1 ? "RED" : "BLUE";
            mensajeGol = `${tiempoFormateado} ⚽ Gol de ${equipoNombre}`;
        }

        partidoActual.historialGoles.push(mensajeGol);
    }

    // Al haber un gol, se limpia el historial de toques para el saque del medio
    ultimoToque = null;
    penultimoToque = null;
};

// Al sacar del medio tras un gol, nos aseguramos de que los toques estén en cero
room.onPositionsReset = function() {
    ultimoToque = null;
    penultimoToque = null;
};

room.onGameStop = async function(byPlayer) {
    if (!partidoActual.activo) return;
	 
    // Usamos el tiempo exacto acumulado por el onGameTick hasta el último segundo vivo
    if (segundosTranscurridosHaxball > 0) {
        const mins = Math.floor(segundosTranscurridosHaxball / 60);
        const secs = Math.floor(segundosTranscurridosHaxball % 60);
        partidoActual.duracion = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        console.log(`⏱️ DURACIÓN FINAL: ${partidoActual.duracion} (${segundosTranscurridosHaxball}s)`);
    } else {
        partidoActual.duracion = "0:00";
    }

    const recBytes = room.stopRecording();
    partidoActual.activo = false;

    if (!recBytes) return;

    await enviarEstadisticasADiscord(recBytes, partidoActual);
    partidoActual.jugadores = {};
    room.sendAnnouncement("⚽ ¡Se ha enviado la grabación al discord!", null, AMARILLO, "bold");
};

// ENVÍO A DISCORD Y GENERACIÓN DEL EMBED
async function enviarEstadisticasADiscord(archivoBytes, datos) {
    let listaRed = "";
    let listaBlue = "";

    // Recorremos las fichas guardadas para listar los nombres y estadísticas por equipo 🛡️
    for (const id in datos.jugadores) {
        const p = datos.jugadores[id];
        
        // Creamos la línea con el nombre del jugador y sus estadísticas individuales
        const lineaJugador = `• **${p.name}**:\n  └ ⚽ ${p.goles} | 👟 ${p.asistencias} | 🤡 O.G: ${p.golesEnContra} | 👣 Toques: ${p.toques}\n`;
        
        if (p.team === 1) {
            listaRed += lineaJugador;
        } else if (p.team === 2) {
            listaBlue += lineaJugador;
        }
    }

    // Si algún equipo quedó completamente vacío, ponemos un aviso válido para Discord
    if (listaRed.trim() === "") listaRed = "*Ningún jugador en este equipo.*";
    if (listaBlue.trim() === "") listaBlue = "*Ningún jugador en este equipo.*";
	
	const frasesDeTitulo = [
        "⚽ PARTIDAZO TERMINADO",
        "🏁 ¡PITAZO FINAL!",
        "🔥 EL PARTIDO HA CONCLUIDO",
        "🚨 TENEMOS RESULTADO FINAL",
        "👑 FIN DEL ENCUENTRO",
        "💥 ¡QUÉ MANERA DE JUGAR! TERMINÓ",
        "📋 REPORTE DE SQUASH / HAXBALL"
    ];

    // Elegimos una posición al azar de la lista
    const tituloAleatorio = frasesDeTitulo[Math.floor(Math.random() * frasesDeTitulo.length)];
	
	// Rango válido seguro para evitar desbordamientos en Discord (Máx 16777215)
	const colorAleatorio = Math.floor(Math.random() * 16777216);

    const embedDiscord = {
        title: tituloAleatorio,
        description: `**RESULTADO FINAL:**\n🔴 RED **${datos.golesRed}** vs **${datos.golesBlue}** BLUE 🔵`,
        color: colorAleatorio, 
        fields: [
            {
                name: "🗺️ DATOS DEL PARTIDO",
                value: `• **Mapa:** ${datos.mapa}\n• **Duración:** ${datos.duracion} min`,
                inline: false
            },
            {
                name: "🔴 JUGADORES RED",
                value: listaRed,
                inline: true
            },
            {
                name: "🔵 JUGADORES BLUE",
                value: listaBlue,
                inline: true
            },
            {
                name: "📝 EVOLUCIÓN DEL MARCADOR",
                value: datos.historialGoles.join("\n") || "Sin goles.",
                inline: false
            }
        ],
        footer: { text: "Repositorio Open Source - ToMaTehhh" },
        timestamp: new Date().toISOString() // Formato de fecha ISO estricto para evitar bugs de región
    };

    const formData = new FormData();
    formData.append("payload_json", JSON.stringify({ embeds: [embedDiscord] }));
    
    const blobRec = new Blob([archivoBytes], { type: "application/octet-stream" });
    const nombreArchivo = `NombreDeLasRec${Date.now()}.hbr2`;
    formData.append("file", blobRec, nombreArchivo);

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, { method: "POST", body: formData });
        if (response.ok) {
            console.log("✅ Reporte y archivo REC enviados a Discord con éxito.");
        } else {
            const errorTexto = await response.text();
            console.error("❌ Discord rechazó el paquete. Código:", response.status, errorTexto);
        }
    } catch (error) {
        console.error("❌ Error de red al intentar enviar a Discord:", error);
    }
}



room.onGameTick = function() {
    if (!partidoActual.activo) return;

    // Cada vez que la API nos deje leer los scores, actualizamos nuestro contador propio
    const scoresSincro = room.getScores();
    if (scoresSincro) {
        segundosTranscurridosHaxball = Math.floor(scoresSincro.time);
    }
};

room.onPlayerJoin = async function(player) {
    MensajeAlIniciar(player);
};

room.onPlayerChat = function(player, message) {
    if (message === "!admin") {
        room.setPlayerAdmin(player.id, true);
        room.sendAnnouncement("[SISTEMA] Te has otorgado los permisos de administrador.", player.id, AMARILLO, "bold");
        return false;
    }
	if (message === "!help") {
		room.sendAnnouncement("[💬]  Comandos disponibles: ...", player.id, AMARILLO, "normal");
		room.sendAnnouncement("[💬]  ...", player.id, AMARILLO, "normal");
		if(player.admin) {
			room.sendAnnouncement("[🔨] !admin (ya lo habrás usado)", player.id, AMARILLO, "bold");
		}
		return false;
	}
	
	return true;
};

