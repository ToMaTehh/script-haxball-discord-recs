# 🎥 SCRIPT para hacer una afiliación mediante Discord para el envío de estadísticas y grabación.
*Bueno, paso a explicar desde cero. ¿El por qué del repositorio? Verán: hace poco rondaba en una comunidad de Haxball, donde encontre que su sistema de RECs mediante el Bot (script) volcaba todas las estadísticas de la base de datos. Es algo simple de hacer pero me gustó el diseño y quería compartirlo para que todos puedan usarlo. Apropiensen de él y compartanlo.*

## FUNCIONES
*- Utilizando la función de Discord de las WebHooks, podemos hacer uso de la misma (en un canal que así lo permita) y mandar la grabación a un canal dentro del servidor asignado.*

*- El canal no sólo recibe el mensaje con el archivo .hbr2, si no que también el conjunto de datos de la base de datos.*

## COSAS A TENER EN CUENTA
*- Dentro del código, he remarcado que, por si solo, la configuración de las estadísticas (let partidoActual = {...}) tiene asignado el mapa como "Classic", pero que creé una variable (NombreDelMapaActual) para que le modifique el nombre, que está a comienzos del script. 
**Mí consejo: NO LA USEN ASÍ**. Para sus servidores, simplemente a la configuración de **mapa:** asignelen la variable que por nombre lleva el estadio personalizado de sus scripts (su room.setCustomStadium(string);, capichi).*

*- El embed está al final del todo, si quieren modificarlo por sus propias cuentas, es por nombre **const embedDiscord = {...}**.*

*- Si ejecutan el código para probar, que sepan que sólamente hay dos comandos, uno que puse para complementar el inicio (!help) y el comando para darse administrador (!admin).*

## REQUERIMOS
```yaml
Configurar: las diferentes variables (a modo de base de datos) que flotan para poder ser rellenadas con los datos del partido, goles, etcétera.
Crear: el Embed para Discord, que es a lo que vinimos a buscar. Pueden buscarla (dentro de index.js) como  'const embedDiscord = {...}'
```
