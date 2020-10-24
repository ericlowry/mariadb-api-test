docker-compose exec -T db \
  sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' \
  < ./db/dnd-sample-data.sql
