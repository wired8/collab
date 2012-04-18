#!/bin/bash
echo "The following node processes were found:"


nodepids=$(ps aux | grep " node " | grep -v grep | cut -c10-15)

echo "OK, so we will stop these process/es now..."

for nodepid in ${nodepids[@]}
do
echo "Stopping PID :"$nodepid
kill -9 $nodepid
done
echo "Done"

echo node --debug-brk server.js | node-inspector --web-port=8082 &

node --debug server.js | node-inspector --web-port=8082 &