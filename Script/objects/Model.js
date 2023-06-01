
class Model{
    
    constructor(algorithm, algorithm_abr, k, hyper_parameters){
        this.algorithm = algorithm
        this.algorithm_abr = algorithm_abr
        this.k = k
        this.hyper_parameters = hyper_parameters
        this.string_text = this.algorithm + ' | k = ' + this.k
    }

    getStringText() {
        let hypers_string = "( "
        for(let hpt of this.hyper_parameters){
            hypers_string += hpt.name+" = "+hpt.selected_value +", "
        }
        
        hypers_string = hypers_string.substring(0, hypers_string.length - 2)
        hypers_string += " )"
        return this.algorithm + hypers_string + ' | k = '+ this.k;
    }

}

