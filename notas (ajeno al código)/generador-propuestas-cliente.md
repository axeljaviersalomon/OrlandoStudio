# Generador de propuestas para clientes de Julián (idea para Paquete 2/3)

> Notas de una conversación exploratoria. Sirve para plantearle la idea a Julián, no es un compromiso cerrado todavía.

## La idea en una frase

Ofrecerle a Julián (CEO de Orlando Studio) que la página de propuesta que hice para mi cliente se convierta en una **plantilla reutilizable**: misma estética y animaciones, pero con el contenido (cliente, diagnóstico, paquetes, precios) cambiado por cada presupuesto que él mande. En vez de un presupuesto en texto plano, manda un link con su identidad de marca.

## Cómo se estructura

Separar **diseño** (fijo) de **contenido** (variable):

- **Fijo** (no lo toca Julián): estética, orden de slides, animaciones, textos institucionales sobre quién es Orlando Studio, logo, colores, tipografías, firma.
- **Variable** (lo llena Julián por cliente): nombre del cliente, diagnóstico ("punto de partida"), 1 a 3 paquetes con qué incluyen y precio, plazos/etapas, mantenimiento, fecha de validez.

## Tres niveles posibles (de más simple a más completo)

| Nivel | Qué es | Cómo lo usa Julián | Para qué paquete |
|---|---|---|---|
| **1 — Archivo por cliente** | Un JSON/`.md` con los datos, duplicando una carpeta | Edita un archivo de texto y sube la carpeta | Paquete 2 |
| **2 — Formulario generador** | Página privada con un formulario que arma la propuesta | Llena campos, ve vista previa, genera un link | Paquete 2 "plus" o Paquete 3 |
| **3 — Panel de propuestas** | Login, listado, estados (enviada/vista/aceptada), duplicar propuestas anteriores | Gestiona todo desde un panel | Paquete 3 |

## Cómo sería el formulario (Nivel 2)

Agrupado por slide de la presentación, con un campo por dato:

- **Portada**: nombre del cliente, fecha, válida hasta.
- **Punto de partida**: qué necesita el cliente (texto libre).
- **Paquetes** (1 a 3, con selector de cantidad): nombre, precio, qué incluye (lista simple, una línea por ítem), marcar como recomendado.
- **Camino / plazos**: etapas, una por línea.
- **Mantenimiento**: incluir o no, texto.

Botones: "Ver vista previa" (la ve exactamente como el cliente) y "Generar link" (URL única, ej. `orlandostudio.com/p/cliente-código`).

## ¿Qué tan personalizable es la estructura?

Dos capas separadas:

1. **Estructura** (la definimos juntos una vez, con desarrollo): qué campos existen, de qué tipo, en qué slide, obligatorios u opcionales. Ejemplos: agregar 3 ítems más al "punto de partida", agregar un campo "Duración" a cada paquete, permitir de 1 a 4 paquetes. Esto es 100% personalizable, pero cada cambio de estructura es trabajo de desarrollo (no lo hace Julián solo).
2. **Contenido** (lo llena Julián, por cliente): solo puede editar lo que la estructura le habilitó. Vos decidís explícitamente qué es editable (precios, textos, plazos) y qué queda bloqueado (logo, colores, orden, identidad).

**Regla práctica**: se define y congela la estructura con desarrollo antes de entregar; después Julián opera libremente dentro de ella. Un campo nuevo más adelante es una modificación chica, aparte o dentro de mantenimiento.

## Puntos a resolver antes de construirlo

1. **Paquetes opcionales**: layout debe soportar 1, 2 o 3 sin romper el diseño ni el "destacado".
2. **Privacidad**: cada propuesta tiene precios → URLs no adivinables (slug + código), `noindex`, nunca en el sitemap.
3. **Vigencia**: campo "válida hasta" visible en portada; si vence, avisa en vez de mostrar precio.
4. **Exportación a PDF**: buen `@media print` cubre la mayoría de los pedidos de clientes que quieren el PDF.

## Cómo venderlo

- **Paquete 2**: "Plantilla de propuesta editable" (Nivel 1) — bajo costo de desarrollo, es refactorizar lo que ya existe.
- **Paquete 3**: "Generador de propuestas" (Nivel 2, opcionalmente Nivel 3).
- **Argumento de venta**: reemplaza el presupuesto en texto plano por una pieza con la misma identidad del sitio; el cliente la recibe como link, no como adjunto.

## Próximo paso sugerido

Refactorizar `propuesta/index.html` al Nivel 1 usando la propuesta actual como primer JSON de prueba, para tener un mecanismo funcionando antes de ofrecérselo a Julián.
