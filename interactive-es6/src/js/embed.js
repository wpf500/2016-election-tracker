import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import d3 from 'd3'
import { AUSCartogram } from './campaignMap'



window.init = function init(el, config) {
    iframeMessenger.enableAutoResize()
    el.innerHTML = embedHTML.replace(/%assetPath%/g, config.assetPath);
    new AUSCartogram("#campaign-map-coalition", politicianMap.get('Tony Abbott'), "#005689")
    new AUSCartogram("#campaign-map-labor", politicianMap.get('Kevin Rudd'), '#b51800')
};
