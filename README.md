# node-red-contrib-pocket
NodeRed node that wrap Pocket API's (formerly known as Read It Later)

## Nodes:
 * **pocket add** to add items to Pocket
 * **pocket read** to read items from Pocket
 * **pocket modify** to modify items from Pocket
 * **pocket credentials** to save Pocket authentication tokens

## Docker
You can test this node using the following docker image:

```
docker run -it -p 1880:1880 -v /home/node-red:/data -u `id -u node-red` --name mynodered petitchevalroux/node-red-docker
```

## Roadmap
 * Extract client api code to a new package

## About
Author: [petitchevalroux](http://petitchevalroux.net)

