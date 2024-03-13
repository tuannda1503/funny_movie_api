export default {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1',
  database: 'funny_movies',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
};
