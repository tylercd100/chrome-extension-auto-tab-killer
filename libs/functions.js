//get a millisecond value for human times
function getMillisecondsFromAmountTime(a,t){
  switch(t){
    case 'days':
    case 'day':
    a*=24;
    case 'hours':
    case 'hour':
    a*=60;
    case 'minutes':
    case 'minute':
    a*=60;
    case 'seconds':
    case 'second':
    a*=1000;
    case 'milliseconds':
    case 'millisecond':
    default:
    console.log('getMillisecondsFromAmountTime',a)
    return a;
    break;
  }
}

//converts byte value into gb value rounded to a specifed float size;
function toGB(value,floatSize){
  if(floatSize===undefined)
    floatSize = 0;
  var GBRaw = value / 1024 / 1024 / 1024;
  fsmod = Math.pow(10,floatSize);
  GBRaw = Math.round(GBRaw*fsmod)/fsmod;
  return GBRaw;
}
function toMB(value,floatSize){
  if(floatSize===undefined)
    floatSize = 0;
  var GBRaw = value / 1024 / 1024;
  fsmod = Math.pow(10,floatSize);
  GBRaw = Math.round(GBRaw*fsmod)/fsmod;
  return GBRaw;
}