import { ENGINE_PATH } from '../../constant';
import express from 'express';
import path from 'path';
import { registerOnlineMapRoutes } from './onlineMapRoutes';

const app = express();
const port = 3434;

app.use(express.static(path.join(ENGINE_PATH, 'server-online-map', 'public')));

registerOnlineMapRoutes(app);

app.listen(port, () => {
  // console.log('palserver Map is running on ' + port);
});
