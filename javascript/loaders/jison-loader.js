import jison from 'jison'

export default source => new jison.Generator(source).generate()
