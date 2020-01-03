module Main exposing (..)

import Animation exposing (px)
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
    { heartGroupStyle : Animation.State
    , lineStyles : List Animation.State
    , viewport : Dom.Viewport
    }


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
            Animation.subscription OnAnimate (params.heartGroupStyle :: params.lineStyles)



-- UPDATE


type Msg
    = OnViewPort (Result Dom.Error Dom.Viewport)
    | OnAnimate Animation.Msg
    | OnCanvasClick
    | NewLineStyle Float


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( OnViewPort (Ok viewport), Initilizing ) ->
            ( Initilized
                { heartGroupStyle =
                    heartAnimation initalHeart
                , lineStyles = []
                , viewport = viewport
                }
            , Cmd.none
            )

        ( OnAnimate animMsg, Initilized m ) ->
            let
                state =
                    Animation.update animMsg m.heartGroupStyle

                lineStyles =
                    List.map (Animation.update animMsg) m.lineStyles
            in
            ( Initilized { m | heartGroupStyle = state, lineStyles = lineStyles }, Cmd.none )

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
            ( Initilized { params | lineStyles = params.lineStyles ++ [ newLineStyle seed width height ] }
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


newLineStyle : Float -> Float -> Float -> Animation.State
newLineStyle seed width height =
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

        v2 =
            Vec2.vec2 (width - x) (height - y)

        direction =
            Vec2.direction v1 v2

        distance =
            Vec2.distance v1 v2

        ( x1, y1 ) =
            Vec2.scale (distance * 0.1) direction
                |> Vec2.add v1
                |> Vec2.toRecord
                |> (\a -> ( a.x, a.y ))

        ( x2, y2 ) =
            Vec2.scale -(distance * 0.1) direction
                |> Vec2.add v2
                |> Vec2.toRecord
                |> (\a -> ( a.x, a.y ))
    in
    Animation.interrupt
        [ Animation.to [ Animation.path [ Animation.moveTo x1 y1, Animation.lineTo x2 y2 ] ]
        ]
        (Animation.style [ Animation.path [ Animation.moveTo x1 y1, Animation.lineTo x1 y1 ] ])


initalHeart : Animation.State
initalHeart =
    Animation.style
        [ Animation.scale 1
        , Animation.rotate3d (Animation.deg 0) (Animation.deg 0) (Animation.deg 0)
        ]


heartAnimation : Animation.State -> Animation.State
heartAnimation style =
    Animation.interrupt
        [ Animation.loop
            [ Animation.to
                [ Animation.scale 0.5
                , Animation.rotate3d (Animation.deg 0) (Animation.deg 0) (Animation.deg 90)
                ]
            , Animation.to
                [ Animation.scale 1
                , Animation.rotate3d (Animation.deg 0) (Animation.deg 0) (Animation.deg 180)
                ]
            , Animation.to
                [ Animation.scale 0.5
                , Animation.rotate3d (Animation.deg 0) (Animation.deg 0) (Animation.deg 270)
                ]
            , Animation.to
                [ Animation.scale 1
                , Animation.rotate3d (Animation.deg 0) (Animation.deg 0) (Animation.deg 360)
                ]
            , Animation.set
                [ Animation.rotate3d (Animation.deg 0) (Animation.deg 0) (Animation.deg 0)
                ]
            ]
        ]
        style


viewPresent : ModelParams -> Html Msg
viewPresent model =
    svg
        [ Attributes.id "canvas"
        , onClick OnCanvasClick
        ]
        [ g
            []
            (List.range
                0
                40
                |> List.map
                    (heartX
                        model
                    )
            )
        , g
            []
            (List.map
                (drawLine model)
                model.lineStyles
            )
        ]


drawLine : ModelParams -> Animation.State -> Html Msg
drawLine { viewport } style =
    let
        { width, height } =
            viewport.viewport

        longDim =
            max width height

        strokeWidth =
            (longDim / 5.0) |> String.fromFloat
    in
    path
        ([ Attributes.stroke "red", Attributes.strokeWidth strokeWidth ]
            ++ Animation.render style
        )
        []



{- Always want hearts to be x*y so scale them so that many fit in each direction

   Base it on long direction
   should fit 6 across there
-}


heartX : ModelParams -> Int -> Html Msg
heartX { viewport, heartGroupStyle } number =
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
        [ g (Animation.render heartGroupStyle) [ hearts ] ]


heartDims : Float
heartDims =
    -- NOTE CAN ADJUST TO SCALE HEART
    300


hearts : Html Msg
hearts =
    --Heart centered and about 300*300 Px
    g [ Attributes.transform "translate(-50, -50)" ]
        [ heart "yellowgreen"
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                3
        , heart "lightblue"
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                2
        , heart "yellowgreen"
            |> Svg.scaleAbout
                (Point2d.pixels 50 50)
                1
        , heart "lightblue"
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
