module Main exposing (..)

import Animation as Anim
import Browser exposing (Document)
import Browser.Dom as Dom
import Browser.Events exposing (onAnimationFrameDelta)
import Dict exposing (..)
import Geometry.Svg as Svg
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Math.Vector2 as Vec2
import Point2d exposing (Point2d)
import Random
import Set exposing (..)
import Svg exposing (Svg, clipPath, g, path, rect, svg)
import Svg.Attributes as Attributes exposing (d, viewBox)
import Task


main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Flags =
    {}



-- MODEL


type Model
    = Initilizing
    | Initilized ModelParams


type alias ModelParams =
    { heartAnim : Anim.Animation
    , lineStyles : List Line
    , viewport : Dom.Viewport
    , time : Float
    }


type alias Line =
    { anim : Anim.Animation, start : Vec2.Vec2 }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( Initilizing
    , getViewPort
    )


getViewPort : Cmd Msg
getViewPort =
    -- TODO Subscribe to viewport change so we can redo this
    Task.attempt OnViewPort (Dom.getViewportOf "canvas")


subscriptions : Model -> Sub Msg
subscriptions model =
    case model of
        Initilizing ->
            Sub.none

        Initilized params ->
            Browser.Events.onAnimationFrameDelta OnAnimate



-- UPDATE


type Msg
    = OnViewPort (Result Dom.Error Dom.Viewport)
    | OnAnimate Float
    | OnCanvasClick
    | NewLineStyle Float


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( OnViewPort (Ok viewport), Initilizing ) ->
            ( Initilized
                { heartAnim = initalHeart 0
                , lineStyles = []
                , viewport = viewport
                , time = 0
                }
            , Cmd.none
            )

        ( OnAnimate delta, Initilized m ) ->
            let
                { time, heartAnim } =
                    m

                newTime =
                    time + delta

                newHeartAnim =
                    if Anim.isDone newTime heartAnim then
                        Anim.undo time heartAnim
                        -- Todo Reset animation

                    else
                        heartAnim
            in
            ( Initilized { m | time = newTime, heartAnim = newHeartAnim }, Cmd.none )

        ( OnCanvasClick, Initilized params ) ->
            let
                { width, height } =
                    params.viewport.scene
            in
            ( model, Random.generate NewLineStyle (seeder (2 * (width + height))) )

        ( NewLineStyle seed, Initilized params ) ->
            let
                { width, height } =
                    params.viewport.scene
            in
            ( Initilized { params | lineStyles = params.lineStyles ++ [ newLineStyle params.time seed width height ] }
            , Cmd.none
            )

        ( OnViewPort x, Initilized _ ) ->
            let
                _ =
                    Debug.log "x " x
            in
            ( model, Cmd.none )

        ( _, Initilizing ) ->
            ( model, Cmd.none )


seeder : Float -> Random.Generator Float
seeder m =
    Random.float 0 m



-- VIEW


view : Model -> Document Msg
view model =
    case model of
        Initilizing ->
            { title = "<3", body = [ svg [ Attributes.id "canvas" ] [] ] }

        Initilized params ->
            { title = "<3", body = [ viewPresent params ] }



{-
   Todo for sizing we could get the whole screen size and do svg to that then position elements inside.
-}


newLineStyle : Float -> Float -> Float -> Float -> Line
newLineStyle time seed width height =
    -- TODO figure out points along a line
    let
        ( x, y ) =
            if seed < width then
                ( seed, 0 )

            else if seed < width + height then
                ( width, seed - width )

            else if seed < 2 * width + height then
                ( seed - width - height, height )

            else
                ( 0, seed - width * 2 - height )

        v1 =
            Vec2.vec2 x y
    in
    -- Todo actual animation here
    { start = v1, anim = Anim.animation time }


initalHeart : Float -> Anim.Animation
initalHeart time =
    Anim.animation time


heartStyle : Float -> Anim.Animation -> List (Html.Attribute Msg)
heartStyle time anim =
    let
        val =
            Anim.animate time anim
    in
    [ Attributes.transform ("scale(" ++ String.fromFloat val ++ ")")
    ]


viewPresent : ModelParams -> Html Msg
viewPresent model =
    svg
        [ Attributes.id "canvas"
        , onClick OnCanvasClick
        ]
        (g
            []
            (List.range
                0
                40
                |> List.map
                    (heartX
                        model
                        "yellowgreen"
                        "lightblue"
                    )
            )
            :: (if List.isEmpty model.lineStyles then
                    []

                else
                    [ Svg.clipPath
                        [ Attributes.id "foreground-clip" ]
                        (List.map
                            (drawLine model)
                            model.lineStyles
                        )
                    , g [ Attributes.clipPath "url(#foreground-clip)" ]
                        [ rect
                            [ Attributes.fill "red"
                            , Attributes.width "100%"
                            , Attributes.height "100%"
                            , Attributes.x "0"
                            , Attributes.y "0"
                            ]
                            []
                        ]
                    ]
               )
        )


pathD : Vec2.Vec2 -> Vec2.Vec2 -> Float -> Float -> String
pathD start end width completion =
    let
        direction =
            Vec2.direction start end

        perp =
            Vec2.toRecord direction
                |> (\v -> Vec2.fromRecord { x = -v.y, y = v.x })
                |> Vec2.normalize

        toTuple v =
            Vec2.toRecord v
                |> (\f -> ( f.x, f.y ))

        distance =
            Vec2.distance start end + 2 * width

        currentDistance =
            distance * completion

        realStart =
            Vec2.add start (Vec2.scale width direction)

        realEnd =
            Vec2.sub end (Vec2.scale width direction)

        p1 =
            Vec2.add realStart (Vec2.scale width perp)

        p2 =
            Vec2.add realStart (Vec2.scale -width perp)

        p3 =
            Vec2.sub p2 (Vec2.scale currentDistance direction)

        p4 =
            Vec2.sub p1 (Vec2.scale currentDistance direction)

        pointToString p =
            String.fromFloat (Vec2.getX p) ++ " " ++ String.fromFloat (Vec2.getY p)
    in
    "M "
        ++ pointToString p1
        ++ " L "
        ++ pointToString p2
        ++ " L "
        ++ pointToString p3
        ++ " L "
        ++ pointToString p4
        ++ " Z"


drawLine : ModelParams -> Line -> Html Msg
drawLine { viewport, time } { start, anim } =
    let
        { width, height } =
            viewport.viewport

        longDim =
            max width height

        strokeWidth =
            longDim / 5.0

        end =
            Vec2.sub (Vec2.vec2 width height) start
    in
    -- TODO CREATE PATH
    path
        [ d (pathD start end strokeWidth (Anim.animate time anim)) ]
        []



{- Always want hearts to be x*y so scale them so that many fit in each direction

   Base it on long direction
   should fit 6 across there
-}


heartX : ModelParams -> String -> String -> Int -> Html Msg
heartX { viewport, heartAnim, time } color1 color2 number =
    let
        { width, height } =
            viewport.viewport

        longDim =
            max width height

        rot =
            (if modBy 2 number == 0 then
                180.0

             else
                0.0
            )
                |> String.fromFloat

        heartSize =
            longDim / 6

        rowsWide =
            ceiling (width / heartSize) + 1

        col =
            number // rowsWide

        row =
            modBy rowsWide number

        scaleFactor =
            heartSize / heartDims |> String.fromFloat

        x =
            toFloat row
                * heartDims
                |> String.fromFloat

        y =
            toFloat col
                * heartDims
                |> String.fromFloat
    in
    g [ Attributes.transform ("scale(" ++ scaleFactor ++ ") translate(" ++ x ++ ", " ++ y ++ ") rotate(" ++ rot ++ " 0 0)") ]
        [ g (heartStyle time heartAnim) [ hearts color1 color2 ] ]


heartDims : Float
heartDims =
    -- NOTE CAN ADJUST TO SCALE HEART
    300


hearts : String -> String -> Html Msg
hearts color1 color2 =
    --Heart centered and about 300*300 Px
    g [ Attributes.transform "translate(-50, -50)" ]
        [ heart color1
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                3
        , heart color2
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                2
        , heart color1
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                1
        , heart color2
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                0.25
        ]


heart : String -> Html Msg
heart fill =
    path [ Attributes.fill fill, d heartPath ] []


heartPath : String
heartPath =
    """M 10,30
    A 20,20 0,0,1 50,30
    A 20,20 0,0,1 90,30
    Q 90,60 50,90
    Q 10,60 10,30 z"""
