# Mapy.cz Tile Downloader
Download high resolution aerial maps from Mapy.cz tiles. 

The map data copyright owner is Seznam.cz, a.s.

License information is available here: https://napoveda.seznam.cz/cz/mapy/mapy-licencni-podminky/licencni-podminky-mapovych-podkladu/

<img src="https://i.imgur.com/Tdwzv8b.png" width="100%" />

## Usage

Requires Node.js.

```
$ npx mapycz-tile-downl <output dir> <zoom level> <from lat> <from long> <to lat> <to long>
```
Zoom level can be up to 20. An output directory is needed to save interim files. 

Example: 
```
$ npx mapycz-tile-downl tiles/ 18 49.199381 16.601219 49.192088 16.613920
```

## License (MIT)

Copyright 2019 Tomáš Martykán

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
