module.exports = () => {
    let newAlias = Math.round(Math.random()*999999)

    while( String(newAlias).length !== 6 ) {
        newAlias = Math.round(Math.random()*999999)
    }

    return newAlias
}