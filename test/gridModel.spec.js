describe("The grid is a set of square boxes representing a view of a loop the synth can play " +
  "in time. The x-axis of the grid represents time and the y-axis represents notes. The view may " +
  "be but a small portion of the ongoing loop or it could be a pattern that isn't active in the " +
  "loops.", 
  function() {

    it("Starts inactive", function () {
      var $firstSquare = $('figure[col="0"][row="0"]');
      expect($firstSquare.hasClass('active')).toBe(false);
    });

    it("Can be clicked to be made active", function () {
      runs( function () {
        var $firstSquare = $('figure[col="0"][row="0"]');
        expect( $firstSquare.trigger('click').hasClass('clicked') ).toBe(true);
      });

      waits(1000);

      runs( function () {
        var $firstSquare = $('figure[col="0"][row="0"]');
        expect($firstSquare.hasClass('active')).toBe(true);
        expect($firstSquare.attr('sequence')).toBe('1');
      });

    });

    it("Can be joined into a sequence of squares", function () {
      runs( function () {
        Util.dbg.clear();
        Util.dbg.initGrid();
        var $firstSquare = $('figure[col="0"][row="0"]');
        var $secondSquare = $('figure[col="1"][row="0"]');
        
        $firstSquare.trigger('mouseenter').trigger('mousedown').trigger('mouseleave');
        $secondSquare.trigger('mouseenter').trigger('mouseup');
        
        expect($firstSquare.attr('sequence')).toBe('2');
      });

      runs( function () {
        var $firstSquare = $('figure[col="0"][row="0"]');
        var $secondSquare = $('figure[col="1"][row="0"]');

        $firstSquare.trigger('click');

        expect($firstSquare.attr('sequence')).toBe('0');
      });
    });

  }
);
