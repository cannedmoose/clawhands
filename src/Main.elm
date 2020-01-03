module Main exposing (..)

import Animation exposing (px)
import Browser exposing (Document)
import Browser.Events exposing (onAnimationFrameDelta)
import Dict exposing (..)
import Geometry.Svg as Svg
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Point2d exposing (Point2d)
import Set exposing (..)
import Svg exposing (Svg, clipPath, g, path, rect, svg)
import Svg.Attributes as Attributes exposing (d, viewBox)


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


type alias Model =
    { heartGroupStyle : Animation.State }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { heartGroupStyle =
            heartAnimation initalHeart
      }
    , Cmd.none
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    Animation.subscription OnAnimate [ model.heartGroupStyle ]



-- UPDATE


type Msg
    = NoOp
    | OnAnimate Animation.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        OnAnimate animMsg ->
            let
                state =
                    Animation.update animMsg model.heartGroupStyle
            in
            ( { model | heartGroupStyle = state }, Cmd.none )



-- VIEW


view : Model -> Document Msg
view model =
    { title = "<3", body = [ viewPresent model ] }



{-
   Todo for sizing we could get the whole screen size and do svg to that then position elements inside.
-}


initalHeart : Animation.State
initalHeart =
    Animation.style
        [ Animation.scale 1
        , Animation.rotate (Animation.deg 0)
        ]


heartAnimation : Animation.State -> Animation.State
heartAnimation style =
    Animation.interrupt
        [ Animation.loop
            [ Animation.to [ Animation.scale 0.5, Animation.rotate (Animation.deg 180) ]
            , Animation.set [ Animation.rotate (Animation.deg -180) ]
            , Animation.to [ Animation.scale 1, Animation.rotate (Animation.deg 0) ]
            ]
        ]
        style


viewPresent : Model -> Html Msg
viewPresent model =
    svg
        [ viewBox "0 0 100 100"
        , Attributes.id "canvas"
        ]
        [ rect [ Attributes.width "100%", Attributes.height "100%", Attributes.fill "brown" ] []
        , clipPath
            [ Attributes.id "boxclip" ]
            [ rect
                [ Attributes.width "85"
                , Attributes.height "85"
                , Attributes.x "7.25"
                , Attributes.y "7.25"
                ]
                []
            ]
        , rect
            [ Attributes.width "85"
            , Attributes.height "85"
            , Attributes.x "7.25"
            , Attributes.y "7.25"
            , Attributes.fill "yellowgreen"
            , Attributes.stroke "black"
            , Attributes.strokeWidth "1"
            ]
            []
        , g
            [ Attributes.clipPath "url(#boxclip)" ]
            [ -- Hearts
              g [ Attributes.transform "translate(50, 50)" ]
                [ g (Animation.render model.heartGroupStyle)
                    [ g [ Attributes.transform "translate(-50, -50)" ]
                        [ heart "lightblue"
                            |> Svg.scaleAbout
                                (Point2d.pixels 50 50)
                                4
                        , heart "yellowgreen"
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
                                0.75
                        , heart "lightblue"
                            |> Svg.scaleAbout
                                (Point2d.pixels 50 50)
                                0.25
                        ]
                    ]
                ]
            ]
        , -- Ribbons TODO consider gradient fill to pretend we have lighting...
          g [ Attributes.transform "translate (7.25 7.25) scale(.85)" ]
            [ g []
                [ g
                    [ Attributes.fill "red", Attributes.stroke "darkred", Attributes.strokeWidth "1" ]
                    [ rect
                        [ Attributes.width "12"
                        , Attributes.height "101"
                        , Attributes.x "44"
                        , Attributes.y "-.5"
                        , Attributes.rx ".1"
                        ]
                        []
                    , path
                        [ d ("""
                            M -.5 -.5
                            L 8.5 -.5
                            L 100.5 """ ++ String.fromFloat (100.5 - 8.5) ++ """
                            L 100.5 100.5
                            L """ ++ String.fromFloat (100.5 - 8.5) ++ """ 100.5
                            L -.5 8.5
                            z
                        """)
                        ]
                        []
                    , path
                        [ d ("""
                            M -.5 100.5
                            L -.5 """ ++ String.fromFloat (100.5 - 8.5) ++ """
                            L """ ++ String.fromFloat (100 - 8.5) ++ """ -.5
                            L 100.5 -.5
                            L 100.5 8.5
                            L 8.5 100.5
                            z
                        """)
                        ]
                        []
                    , rect
                        [ Attributes.height "12"
                        , Attributes.width "101"
                        , Attributes.y "44"
                        , Attributes.x "-.5"
                        , Attributes.rx ".1"
                        ]
                        []
                    ]
                ]
            ]
        , ribbon
        ]


ribbon =
    g
        []
        []


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
