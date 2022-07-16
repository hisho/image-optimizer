import minimist from 'minimist'
import chokidar from 'chokidar'
import path from 'path'

const confg = {
  src: 'src/images/',
}

export const main = async (args: string[]) => {
  const argv = minimist<{watch: string}>(args, {
    string: ['watch'],
    alias: { w: 'watch' },
  })
  console.log(argv)

  if (argv.watch !== undefined) {
    chokidar
      .watch(
        ['**/*.png', '**/*.jpg'].map((n) => path.join(confg.src, n)),
        {
          ignoreInitial: true,
        }
      )
      .on('all', (eventName, path) => {
        console.log('Watching...')
      })
  } else {
    console.log('Building...')
  }
}
