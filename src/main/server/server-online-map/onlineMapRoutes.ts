import axios from 'axios';
import { Express } from 'express';
import getAdminConnectionConfig from '../../services/admin/getAdminHost';

export function registerOnlineMapRoutes(app: Express) {
  app.get('/:serverId/players', async (req, res) => {
    const serverId = req.params.serverId;

    const { host, restPort, adminPassword } =
      await getAdminConnectionConfig(serverId);

    try {
      const result = await axios(`http://${host}:${restPort}/v1/api/players`, {
        method: 'get',
        auth: {
          username: 'admin',
          password: adminPassword,
        },
      });

      res.send(result.data || {});
    } catch (e) {
      res.send({});
    }
  });

  app.get('/:serverId/info', async (req, res) => {
    const serverId = req.params.serverId;

    const { host, restPort, adminPassword } =
      await getAdminConnectionConfig(serverId);

    try {
      const result = await axios(`http://${host}:${restPort}/v1/api/info`, {
        method: 'get',
        auth: {
          username: 'admin',
          password: adminPassword,
        },
      });

      res.send(result.data || {});
    } catch (e) {
      res.send({});
    }
  });
}
