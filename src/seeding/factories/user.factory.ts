import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../auth/user.entity';

export default setSeederFactory(User, async () => {
  const user = new User();
  user.email = faker.internet.email();
  user.password = await bcrypt.hash('qwerty', 10);
  return user;
});
