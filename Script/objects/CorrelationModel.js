
class CorrelationModel{
    
    constructor(algorithm, threshold){
        this.algorithm = algorithm
        this.threshold = threshold
        this.string_text = this.algorithm + ' | threshold = ' + this.threshold;
    }

    getStringText() {
        return this.algorithm + ' | threshold = ' + this.threshold;
    }
}

