# uhodni-kde-jsem
Zábavná hra, kde se načte mapa, z obrázku musíme uhodnout, kde se zhruba místo nachází, pokuď se poté na mapě netrefíte do radiusu která je dána (dle obecné znalosti), nezískáváte body nebo získáváte.

https://uhodni-kde-jsem.vercel.app/

## Bugs:

* vypočítaná trasa je pozemní nýbrž letecká, tím pádem zvolený bod nemusí odpovídat letecké hodnotě "vzdušnou čarou" **vyřešeno**
* aktuální verze není moc mobile friendly, pracuje se na tom **vyřešeno**

## Features:
* Trasa se již nepočítá cestou autem, ale počítá se přes algoritmus - Sférický zákon kosinů (viz. http://www.movable-type.co.uk/scripts/latlong.html)



Verze: 0.1
