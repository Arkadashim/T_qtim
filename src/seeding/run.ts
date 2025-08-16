/* eslint-disable @typescript-eslint/no-floating-promises */
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { connectionSource } from '../config/typeorm';

(async () => {
  const options: DataSourceOptions & SeederOptions = {
    ...connectionSource.options,
    seeds: ['dist/seeding/seeds/**/*{.ts,.js}'],
    factories: ['dist/seeding/factories/**/*{.ts,.js}'],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource);
})();
