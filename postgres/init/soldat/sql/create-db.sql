CREATE USER soldat;
\password soldat

CREATE DATABASE soldat;

GRANT ALL ON DATABASE soldat TO soldat;

CREATE TABLESPACE soldatspace OWNER soldat LOCATION '/tablespace/soldat';
