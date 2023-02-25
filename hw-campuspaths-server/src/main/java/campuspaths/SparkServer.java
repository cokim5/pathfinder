/*
 * Copyright (C) 2022 Kevin Zatloukal and James Wilcox.  All rights reserved.  Permission is
 * hereby granted to students registered for University of Washington
 * CSE 331 for use solely during Autumn Quarter 2022 for purposes of
 * the course.  No other use, copying, distribution, or modification
 * is permitted without prior written consent. Copyrights for
 * third-party components of this work must be honored.  Instructors
 * interested in reusing these course materials should contact the
 * author.
 */

package campuspaths;

import campuspaths.utils.CORSFilter;
import com.google.gson.Gson;
import pathfinder.CampusMap;
import pathfinder.datastructures.Path;
import pathfinder.datastructures.Point;
import pathfinder.textInterface.CoordinateProperties;
import pathfinder.textInterface.Direction;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SparkServer {

    // methods do not require a try/catch because front end passes in only valid
    // input as params for each fetch. Buildings are chosen from the server as well
    // so all buildings will exist
    public static void main(String[] args) {
        CORSFilter corsFilter = new CORSFilter();
        corsFilter.apply();
        // The above two lines help set up some settings that allow the
        // React application to make requests to the Spark server, even though it
        // comes from a different server.
        // You should leave these two lines at the very beginning of main().

        CampusMap map = new CampusMap();

        // Returns JSON containing shortest path from params "start" to "end"
        Spark.get("getPath", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception{
                String start = req.queryParams("start");
                String end = req.queryParams("end");
                Path<Point> shortestPath = map.findShortestPath(start, end);
                Gson tempGson = new Gson();
                return tempGson.toJson(shortestPath);
            }
        });

        // Returns JSON containing all of the buildings in campus_buildings.csv
        Spark.get("getBuildings", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                Map<String, String> buildingNames = map.buildingNames();
                Gson tempGson = new Gson();
                return tempGson.toJson(buildingNames);
            }
        });

        // Returns JSON containing text directions that describe the shortestPath
        Spark.get("getDirections", new Route() {
           @Override
           public Object handle(Request req, Response res) throws Exception {
               String start = req.queryParams("start");
               String end = req.queryParams("end");
               Path<Point> shortestPath = map.findShortestPath(start, end);
               List<String> directions = new ArrayList<>();

               for(Path<Point>.Segment segment : shortestPath) {
                   Direction tempDirection = Direction.resolveDirection(
                           segment.getStart().getX(),
                           segment.getStart().getY(),
                           segment.getEnd().getX(),
                           segment.getEnd().getY(),
                           CoordinateProperties.INCREASING_DOWN_RIGHT
                   );
                   String directionText = String.format("Go %.0f feet %s", segment.getCost(),
                           tempDirection.name());
                   directions.add(directionText);
               }
               String totalDistanceText = String.format("Your total distance is: %.0f feet",
                       shortestPath.getCost());
               directions.add(totalDistanceText);
               Gson gson = new Gson();
               return gson.toJson(directions);
           }
        });
    }

}
