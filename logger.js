import pino from 'pino';

import pretty from 'pino-pretty';




const transport = pino.transport({
 
      target: 'pino-pretty',
      options: {
        colorize: true,
        level: "debug",
      },
  
});
const logger = pino(pretty(transport));
export default logger;
