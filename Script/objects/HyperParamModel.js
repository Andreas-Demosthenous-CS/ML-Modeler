class HyperParamModel {

    constructor(algorithm, algorithm_abr, k, hyper_parameters) {
        this.algorithm = algorithm
        this.algorithm_abr = algorithm_abr
        this.k = k
        this.hyper_parameters = hyper_parameters
        this.string_text = this.algorithm + ' | k = ' + this.k
    }
    getStringText() {
        var hyper_params_string = "( "
        var total_executions = 1;
        for (var hpt of this.hyper_parameters) {
            if (hpt.type == "num_range") {
                var exec_cnt = Math.floor((hpt.selected_stop - hpt.selected_start) / hpt.selected_incr) + 1
                if (!isDecimal(hpt.incr)) {
                    hyper_params_string += "<strong>" + hpt.name + "</strong> = [ " + hpt.selected_start + ", " + Number(Number(hpt.selected_start) + Number(hpt.selected_incr))
                        + ", " + Number(Number(hpt.selected_start) + Number(hpt.selected_incr) * 2) + ", ... , " + Number(Number(hpt.selected_start) +
                            Number(hpt.selected_incr) * (exec_cnt - 1)) + " ], "

                }
                else {
                    hyper_params_string += "<strong>" + hpt.name + "</strong> = [ " + hpt.selected_start + ", " + Number(Number(hpt.selected_start) +
                        Number(hpt.selected_incr)).toFixed(1) + ", " + Number(Number(hpt.selected_start) + Number(hpt.selected_incr) * 2).toFixed(1) +
                        ", ... , " + Number(Number(hpt.selected_start) + Number(hpt.selected_incr) * (exec_cnt - 1)) + " ], "
                }

                total_executions *= exec_cnt
            }
            else if (hpt.type == "class_range" || hpt.type == "boolean") {
                hyper_params_string += "<strong>" + hpt.name + "</strong> = [ "
                for (var hpt_class of hpt.selected_value_range) {
                    hyper_params_string += hpt_class + ", "
                }
                hyper_params_string = hyper_params_string.substring(0, hyper_params_string.length - 2)
                hyper_params_string += " ], "

                total_executions *= hpt.selected_value_range.length
            }
        }
        hyper_params_string = hyper_params_string.substring(0, hyper_params_string.length - 2)
        hyper_params_string += " )"
        total_executions *= this.k

        return this.algorithm + hyper_params_string + ' | k = ' + this.k + " | Total executions = " + total_executions;
    }


}