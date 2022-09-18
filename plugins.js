import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';
import svgoautocrop from 'svgo-autocrop';


const pluginOverride = () => {
  return [
    imageminSvgo({
      js2svg: {
        indent: 2, // string with spaces or number of spaces. 4 by default
        pretty: true, // boolean, false by default
      },
      plugins: [svgoautocrop, 'preset-default'],
    }),
    imageminMozjpeg({quality: 80, quantTable: 3}),
    imageminPngquant({
      quality: [0.6, 0.8],
    }),
    imageminGifsicle(),
  ];
};
export default pluginOverride;
