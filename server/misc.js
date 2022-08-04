const moment = require('moment');

exports.calcPrice=function(categ,kmd,eta,guidAdd,ass,dataI,dataF,nPastRents,percAvailable){
    let price;
    let dI=moment(dataI);
    let dF=moment(dataF);

    switch(categ) {
        case "A":
        price=80;
        break;
        case "B":
        price=70;
        break;
        case "C":
        price=60;
        break;
        case "D":
        price=50;
        break;
        case "E":
        price=40;
        break;
        default:
    } 
    
    switch(kmd){
        case 'meno di 50km':
        price=price*0.95;
        break;
        //case 'tra 50 e 150km':
        //break;
        case 'illimitato':
        price=price*1.05;
        break;
        default:
    }

    switch(eta){
        case 'sotto 25 anni':
        price=price*1.05;
        break;
        case 'oltre 65 anni':
        price=price*1.1;
        break;
        default:
    }
    
    switch(guidAdd){
            case 'y':
            price=price*1.15;
            break;
            default:
    }
    
    switch(ass){
        case 'y':
        price=price*1.2;
        break;
        default:
    }

    if(nPastRents>=3)
        price=price*0.9;
    
    if(percAvailable<0.1)
        price=price*1.1;

    let n=dF.diff(dI,'days')+1;
    return price*n;
}
