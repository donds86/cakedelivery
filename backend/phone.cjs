'use strict';
const {fail}=require('./domain.cjs');
function brazilPhone(value,optional=true){if(value===undefined||value===''){if(optional)return '';fail(400,'Informe DDD e número do WhatsApp')}if(typeof value!=='string'||!/^[+\d()\s.-]+$/.test(value))fail(400,'WhatsApp inválido: informe DDD e número');let digits=value.replace(/\D/g,'');if(digits.length===10||digits.length===11)digits='55'+digits;if(!/^55[1-9]\d{9,10}$/.test(digits))fail(400,'WhatsApp inválido: use +55, DDD e número com 8 ou 9 dígitos');return digits}
module.exports={brazilPhone};
