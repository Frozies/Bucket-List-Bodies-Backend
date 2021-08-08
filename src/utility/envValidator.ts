export const envChecker = (variables: string[]) => {
    if (Array.isArray(variables) === false) {
        throw (new Error('ENV File must be a array.'))
    }
    if (variables.length <= 0) {
        throw (new Error('ENV File can not be empty.'))
    }

    const env = process.env
    const lostItems: string[] = []
    const validItems: string[] = []

    variables.forEach((variable: string) => {
        if (!(variable in env)) {
            lostItems.push(variable)
        } else {
            validItems.push(variable)
        }
    })

    if (lostItems.length > 0) {
        console.error(lostItems)
        throw (new Error('These variables are required.'))
    }

    validItems.forEach((variable: string) => {
        const envVar = process.env[variable]
        if (envVar == '') {
            throw (new Error('Environmental variable value required: ' + variable))
        }
    })

    return true
}