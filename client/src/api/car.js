class Car{
    /*
    parametri:
    - ID (int): 0...
    - marca (String): (...)
    - modello (String): (...)
    - categoria (char): A...E
    */ 
    constructor(carID,brand,model,category){
        this.carID=carID;
        this.brand=brand;
        this.model=model;
        this.category=category;
    }
    
    static from(json){
        return Object.assign(new Car(),json);
    }
}

export default Car;