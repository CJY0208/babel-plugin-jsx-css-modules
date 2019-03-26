export const getMatcher = (styles, prefer) => classNames => {
  let globalClassNames = []
  let localClassNames = []
  let restClassNames = classNames
    .replace(/:global\([\s\S]*?\)/g, text => {
      globalClassNames = globalClassNames.concat(
        text
          .trim()
          .replace(/(:global\(|\))/g, '')
          .split(' ')
      )
      return ''
    })
    .replace(/:local\([\s\S]*?\)/g, text => {
      localClassNames = localClassNames.concat(
        text
          .trim()
          .replace(/(:local\(|\))/g, '')
          .split(' ')
      )
      return ''
    })
    .trim()
    .split(' ')

  if (prefer === 'local') {
    localClassNames = localClassNames.concat(restClassNames)
  } else {
    globalClassNames = globalClassNames.concat(restClassNames)
  }

  return localClassNames
    .map(className => styles[className] || className)
    .concat(globalClassNames)
    .join(' ').trim()
}
