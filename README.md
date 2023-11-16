# teachess
At the moment, a chess UI built for educational purposes
# TODO:
- ADD LOGIC TO AI MOVES
- implement some ai, even a little
- implement animations/smoothing over
- openings move finished, now to add table evaluations.
- add palette swap for when playing as black.
- add deep minimax
- add alpha beta pruning
## ideas
- random opening play
## notes
- remove highlight when selecting a move? (unclear)
- add svm implementation, ideas:
aggressive or defensive moves (neutral).
- has a rendency to trigger stalemate.
- because it relies on positional boards, i may need to do endgame boards as well to bring out pieces
- slightly breaks when trading pieces (look into)
- animation still locks up but much better than before (can go 4 depths without crashing!)
- actual implementation may be different, working off localhost.
- implement sounds, simple board click to increase experience
- maybe have notations be on at all times? theyre not being used as is
- no logic to ai moves
- promotion logic wip
- kingcheck logic for ai
- animations maybe? for smoother transitions (look into this).
- sounds? doable
- fen parser for use in image scanning(set up when possible).
- promotions have trouble with redo undo with ai move (fixed).
- random move is clunky, implement piece square table.
- keep track of enpassant movement specifically for when the king is checked
- undo/redo tracking.

## Assets Used
### Openings
    Data forked over from lichess.org
    https://github.com/lichess-org/chess-openings/

### Sprites:
    Made by me.
    www.pixilart.com
### TooMuchInkFont:
    Made by K Guillory
    https://www.dafont.com/toomuchink.font
    
