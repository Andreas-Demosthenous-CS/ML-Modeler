class Configuration{

    constructor(dataset, target_class, quantity){
        this.dataset = dataset
        this.target_class = target_class
        this.quantity = quantity
        this.string_text = "| "+this.dataset+" | "+this.target_class+" | "+this.quantity+" |"
    }


}
