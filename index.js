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
var ContraseñaDeLaSala = 				"Contraseña123";								// Si SalaPublica = false, la contraseña es ContraseñaDeLaSala

var LocalizacionDelServidor =   		"AR"; 											// AR = Argentina
var Latitud	=							-38.872;									
var Longitud = 							-58.3819;

var NombreDelBot =              		"Gato de Monitoreo"; 							// Si NoQuieroUnRobot es true, ignorar, si es false se le asigna el nombre de NombreDelBot

// - VARIABLES GLOBALES
var NombreDeLasRec =                    "Prueba_De_Base_De_Datos"; 						// Nombre a asignar a los archivos .hbr2 + Date.now
const DISCORD_WEBHOOK_URL = 			"https://discord.com/api/webhooks/1515251444150833251/uJAJ2zubk4hYz3YZUfwUK1QnS2pWmufzDnKMEw1Dpbvck1MsvmrUoGXiYK1rD8TGvUyD"; 									// Simplemente usa el URL que te devuelva tu canal de Discord.

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
    golesRed: 0,
    golesBlue: 0,
    historialGoles: [],
    jugadores: {} 
};

// SISTEMA DE RASTREO DE BALÓN (Para Goles y Asistencias)
// Guardaremos los objetos de los últimos jugadores que patearon/tocaron el balón
let ultimoToque = null;
let penultimoToque = null;

// Cuando un jugador se une al equipo Red o Blue, le creamos su ficha de estadísticas
room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
    if (changedPlayer.team === 0) return; 

    if (!partidoActual.jugadores[changedPlayer.auth]) {
        partidoActual.jugadores[changedPlayer.auth] = {
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
        partidoActual.jugadores[changedPlayer.auth].team = changedPlayer.team;
    }
};

room.onPlayerLeave = function(player) {
    // Mantenemos los datos por si sale en medio del partido, para el reporte final.
};

// 🎮 EVENTOS DE JUEGO

room.onGameStart = function(byPlayer) {
    room.startRecording();
	room.sendAnnouncement("🎥 Grabación (.hbr2) iniciada. ¡Saluden al server de Discord", null, AMARILLO, "bold");
    console.log("🎥 Grabación (.hbr2) iniciada. ¡Saluden al server de Discord");

    partidoActual.activo = true;
    partidoActual.golesRed = 0;
    partidoActual.golesBlue = 0;
    partidoActual.historialGoles = [];
    partidoActual.mapa = NombreDelMapaActual;
    
    // Resetear el rastreador de toques al sacar del medio
    ultimoToque = null;
    penultimoToque = null;
    
    room.getPlayerList().forEach(player => {
        if (player.team !== 0) {
            partidoActual.jugadores[player.auth] = {
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
    if (partidoActual.jugadores[player.auth]) {
        partidoActual.jugadores[player.auth].toques++;
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
            // Caso 1: GOL NORMAL (El jugador que tocó la pelota pertenece al equipo que anotó)
            if (ultimoToque.team === team) {
                mensajeGol = `${tiempoFormateado} ⚽ Gol de ${ultimoToque.name}`;
                
                // Sumamos el gol a sus estadísticas en memoria
                if (partidoActual.jugadores[ultimoToque.auth]) {
                    partidoActual.jugadores[ultimoToque.auth].goles++;
                }

                // Verificamos si hubo asistencia (El penúltimo toque fue del mismo equipo y no es el mismo jugador)
                if (penultimoToque !== null && penultimoToque.team === team && penultimoToque.id !== ultimoToque.id) {
                    mensajeGol += ` | 👟 Asistencia de ${penultimoToque.name}`;
                    if (partidoActual.jugadores[penultimoToque.auth]) {
                        partidoActual.jugadores[penultimoToque.auth].asistencias++;
                    }
                }
            } 
            // Caso 2: AUTOGOL / GOL EN CONTRA (El jugador la metió en su propio arco)
            else {
                mensajeGol = `${tiempoFormateado} 🤡 Autogol de ${ultimoToque.name}`;
                if (partidoActual.jugadores[ultimoToque.auth]) {
                    partidoActual.jugadores[ultimoToque.auth].golesEnContra++;
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
    
    const recBytes = room.stopRecording();
    partidoActual.activo = false;

    if (!recBytes) return;

    const scores = room.getScores();
    if (scores) {
        const mins = Math.floor(scores.time / 60);
        const secs = Math.floor(scores.time % 60);
        partidoActual.duracion = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    await enviarEstadisticasADiscord(recBytes, partidoActual);
    partidoActual.jugadores = {};
	room.sendAnnouncement("¡Se ha enviado la grabación al discord!", null, AMARILLO, "bold");
};

// ENVÍO A DISCORD Y GENERACIÓN DEL EMBED
async function enviarEstadisticasADiscord(archivoBytes, datos) {
    let listaRed = "";
    let listaBlue = "";

    for (const auth in datos.jugadores) {
        const p = datos.jugadores[auth];
        
        // Formateamos la string agregando de forma condicional si tiene Goles en Contra (Autogoles)
        let detalles = `⚽ ${p.goles} | 👟 ${p.asistencias}`;
        if (p.golesEnContra > 0) detalles += ` | 🤡 O.G: ${p.golesEnContra}`;
        detalles += ` | 👣 Toques: ${p.toques}`;

        const lineaStats = `• **${p.name}**:\n  └─ ${detalles}\n`;
        
        if (p.team === 1) {
            listaRed += lineaStats;
        } else if (p.team === 2) {
            listaBlue += lineaStats;
        }
    }

    const embedDiscord = {
        title: "⚽ PARTIDAZO TERMINADO",
        description: `**RESULTADO FINAL:**\n🔴 RED **${datos.golesRed}** vs **${datos.golesBlue}** BLUE 🔵`,
        color: 3066993, 
        fields: [
            {
                name: "🗺️ DATOS DEL PARTIDO",
                value: `• **Mapa:** ${datos.mapa}\n• **Duración:** ${datos.duracion} min`,
                inline: false
            },
            {
                name: "🔴 DESEMPEÑO RED",
                value: listaRed || "No hubo jugadores en este equipo.",
                inline: true
            },
            {
                name: "🔵 DESEMPEÑO BLUE",
                value: listaBlue || "No hubo jugadores en este equipo.",
                inline: true
            },
            {
                name: "📝 EVOLUCIÓN DEL MARCADOR",
                value: datos.historialGoles.join("\n") || "Sin goles.",
                inline: false
            }
        ],
        footer: { text: "Repositorio Open Source - ToMaTehhh" },
        timestamp: new Date()
    };

    const formData = new FormData();
    formData.append("payload_json", JSON.stringify({ embeds: [embedDiscord] }));
    
    const blobRec = new Blob([archivoBytes], { type: "application/octet-stream" });
    const nombreArchivo = `NombreDeLasRec${Date.now()}.hbr2`;
    formData.append("file", blobRec, nombreArchivo);

    try {
        await fetch(DISCORD_WEBHOOK_URL, { method: "POST", body: formData });
        console.log("✅ Reporte y archivo REC enviados a Discord con éxito.");
    } catch (error) {
        console.error("❌ Error de red al intentar enviar a Discord:", error);
    }
}

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

