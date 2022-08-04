class Rental{
    /*
    parametri:
    - rentalID (int): 0...
    - categoria (char): A...E
    - dataI (String): (in formato YYYY-MM-DD)
    - dataF (String): (in formato YYYY-MM-DD)
    */ 
    constructor(rentalID,category,dataI,dataF){
        this.rentalID=rentalID;
        this.category=category;
        this.dataI=dataI;
        this.dataF=dataF;
    }
    
    static from(json){
        return Object.assign(new Rental(),json);
    }
}

export default Rental;