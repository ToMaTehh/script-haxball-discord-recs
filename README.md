# 🎥 — HAXBALL DISCORD BOT RECs
![haxballDiscordBotRecs Banner](https://media.discordapp.net/attachments/1511168458979803187/1517112087674097764/recs.jpg?ex=6a35183c&is=6a33c6bc&hm=e6a33d64a402238db028894f3657a97324834046b1c3e3ece3913fab5fd21daa&=&format=webp&width=1000&height=500)
### Sistema de estadísticas y grabación automatizada
*Bueno, paso a explicar desde cero. ¿El por qué del repositorio? Verán: hace poco rondaba en una comunidad de Haxball, donde encontre que su sistema de RECs mediante el Bot (script) volcaba todas las estadísticas de la base de datos. Es algo simple de hacer pero me gustó el diseño y quería compartirlo para que todos puedan usarlo. Apropiensen de él y compartanlo.*

## 🔧 — FUNCIONES DEL SCRIPT
*- Utilizando la función de Discord de las WebHooks, podemos hacer uso de la misma (en un canal que así lo permita) y mandar la grabación a un canal dentro del servidor asignado.*

*- El canal no sólo recibe el mensaje con el archivo .hbr2, si no que también el conjunto de datos de la base de datos.*

## 📌 — COSAS A TENER EN CUENTA
*- Dentro del código, he remarcado que, por si solo, la configuración de las estadísticas ```(let partidoActual = {...})``` tiene asignado el mapa como "Classic", pero que creé una variable ```(NombreDelMapaActual)``` para que le modifique el nombre, que está a comienzos del script. 
**Mí consejo: NO LA USEN ASÍ**. Para sus servidores, simplemente a la configuración de **mapa:** asignelen la variable que por nombre lleva el estadio personalizado de sus scripts ```(su room.setCustomStadium(string);, capichi).```*

*- El embed está al final del todo, si quieren modificarlo por sus propias cuentas, es por nombre ```const embedDiscord = {...}```.*

*- Si ejecutan el código para probar, que sepan que sólamente hay dos comandos, uno que puse para complementar el inicio ```(!help)``` y el comando para darse administrador ```(!admin)```.*

## 📷 — IMAGEN DEMOSTRATIVA DEL EMBED
<img src="https://cdn.discordapp.com/attachments/783191826022531083/1515471058185097286/image.png?ex=6a2f1fe8&is=6a2dce68&hm=363b6d8a522ee2f5c1b4c55e90193bdfc811bdf8eab673d684004c3d3b688260" alt="Imagen a modo de ejemplo del mensaje que se envía al canal de la respectia WebHook" width="569">

## 📄 — REQUERIMOS PARA EL FUNCIONAMIENTO
```yaml
Configurar: las diferentes variables (a modo de base de datos) que flotan para poder ser rellenadas con los datos del partido, goles, etcétera.
Crear: el Embed para Discord, que es a lo que vinimos a buscar. Pueden buscarla (dentro de index.js) como  'const embedDiscord = {...}'
```
